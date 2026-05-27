import { normalizeValue } from "../utils/textUtils.js";

const QUESTION_TERMS = /(时间|日期|身高|体重|分期|评分|类型|分型|状态|情况|是否|方案|治疗|剂量|用药|药物|RECIST|BMI|BSA|ECOG|ISS|IPI|PET|SUV|Hb|WBC|ANC|PLT|ALT|AST|Cr|eGFR|MRD|CRS|ICANS|GVHD)/i;

export function extractQuestionAnswerItems(input) {
  const lines = String(input ?? "")
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .flatMap(splitTableLikeLine)
    .map((line) => line.trim())
    .filter(Boolean);
  const items = [];
  let pending = null;

  for (const line of lines) {
    const inline = splitInlineQuestionAnswer(line);
    if (inline) {
      flushPending(items, pending);
      pending = null;
      items.push(inline);
      continue;
    }
    if (looksLikeQuestion(line)) {
      flushPending(items, pending);
      pending = { rawQuestion: stripQuestionNumber(line), rawAnswer: "", source: "lineBreak" };
      continue;
    }
    if (pending) {
      pending.rawAnswer = [pending.rawAnswer, cleanChoiceLine(line)].filter(Boolean).join("，");
    } else {
      items.push({ rawQuestion: "未识别题干", rawAnswer: cleanChoiceLine(line), source: "unmatched" });
    }
  }
  flushPending(items, pending);
  return items.filter((item) => item.rawQuestion && item.rawAnswer);
}

export function splitInlineQuestionAnswer(line) {
  const normalized = String(line ?? "").replace(/[：﹕︰]/g, ":");
  const colon = normalized.match(/^(.*?):\s*(.+)$/);
  if (colon) return buildItem(colon[1], colon[2], "inline");
  const tabParts = normalized.split(/\t+/).map((part) => part.trim()).filter(Boolean);
  if (tabParts.length >= 2 && looksLikeQuestion(tabParts[0])) return buildItem(tabParts[0], tabParts.slice(1).join("，"), "table");
  const space = normalized.match(/^(.{2,36}?)\s{1,}(.+)$/);
  if (space && looksLikeQuestion(space[1])) return buildItem(space[1], space[2], "space");
  return null;
}

export function looksLikeQuestion(line) {
  const text = String(line ?? "").trim();
  if (/^(答案|请选择|选项)[:：]/.test(text)) return false;
  if (/^\d+\s*[、.．]?\s*.+/.test(text)) return true;
  return QUESTION_TERMS.test(text) && text.length <= 60;
}

function splitTableLikeLine(line) {
  const text = String(line ?? "");
  if (!text.includes("\t")) return [text];
  return [text];
}

function buildItem(question, answer, source) {
  return {
    rawQuestion: stripQuestionNumber(question),
    rawAnswer: cleanChoiceLine(answer),
    source
  };
}

function stripQuestionNumber(value) {
  return String(value ?? "").replace(/^\d+\s*[、.．]?\s*/, "").trim();
}

function cleanChoiceLine(value) {
  return normalizeValue(String(value ?? "").replace(/^[答案选项]+\s*[：:]\s*/, ""));
}

function flushPending(items, pending) {
  if (pending?.rawQuestion && pending.rawAnswer) items.push(pending);
}
