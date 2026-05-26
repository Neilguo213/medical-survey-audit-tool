import { matchField } from "./fieldMatcher.js";
import { normalizeValue } from "../utils/textUtils.js";

export function parseCase(input, template) {
  const rawItems = extractQuestionAnswerItems(input);
  const claimedFieldIds = new Set();
  const fields = [];
  const answers = {};
  const unmatchedItems = [];

  for (const item of rawItems) {
    const match = matchField(item.rawQuestion, template, claimedFieldIds);
    if (!match) {
      unmatchedItems.push(item);
      continue;
    }
    const parsed = {
      fieldId: match.field.fieldId,
      fieldName: match.field.fieldName,
      module: match.field.module,
      rawQuestion: item.rawQuestion,
      rawAnswer: item.rawAnswer,
      normalizedValue: normalizeValue(item.rawAnswer),
      confidence: match.confidence,
      source: item.source,
      matchedBy: match.matchedBy
    };
    fields.push(parsed);
    answers[parsed.fieldId] = parsed.normalizedValue;
    claimedFieldIds.add(parsed.fieldId);
  }

  return { fields, answers, unmatchedItems, rawItems };
}

export function extractQuestionAnswerItems(input) {
  const lines = String(input ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
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

function splitInlineQuestionAnswer(line) {
  const match = line.match(/^(.*?)[：:]\s*(.+)$/);
  if (!match) return null;
  return {
    rawQuestion: stripQuestionNumber(match[1]),
    rawAnswer: cleanChoiceLine(match[2]),
    source: "inline"
  };
}

function looksLikeQuestion(line) {
  if (/^(答案|请选择|选项)[:：]/.test(line)) return false;
  if (/^\d+\s*[、.．]?\s*.+/.test(line)) return true;
  return /(时间|日期|身高|体重|分期|评分|类型|分型|状态|情况|是否|RECIST|BMI|BSA|ECOG|ISS|IPI)/i.test(line) && line.length <= 40;
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
