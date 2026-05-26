const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

const root = __dirname;
const port = Number(process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    if (requestUrl.pathname === "/api/extract") {
      const target = requestUrl.searchParams.get("url");
      const data = await extractSurvey(target);
      sendJson(res, data);
      return;
    }

    const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = path.join(root, pathname);
    if (!filePath.startsWith(root)) {
      send(res, 403, "Forbidden");
      return;
    }
    const body = await fs.readFile(filePath);
    res.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch (error) {
    sendJson(res, { error: error.message }, 500);
  }
});

server.listen(port, () => {
  console.log(`病例审核工具已启动：http://localhost:${port}`);
});

async function extractSurvey(targetUrl) {
  if (!targetUrl) throw new Error("请提供问卷链接。");
  const parsed = new URL(targetUrl);
  if (!/wenwo\.com$/.test(parsed.hostname)) throw new Error("目前只支持 wenwo.com 问卷链接。");

  const surveyId = parsed.pathname.match(/\/nsurvey\/(\d+)/)?.[1] || parsed.searchParams.get("questionnaireId");
  const answerId = parsed.searchParams.get("answerId");
  if (!surveyId && !answerId) throw new Error("链接中未识别到 surveyId 或 answerId。");
  if (!answerId) throw new Error("链接中没有 answerId，无法抓取已填写答案。");

  const answerDetail = await postWenwo("/medic/h5/formtemplate/getQuestionnaireAnswerDetail", {
    behaveId: answerId,
    communityId: parsed.searchParams.get("communityId") || undefined,
    textShowRuleId: parsed.searchParams.get("textShowRuleId") || undefined
  }, targetUrl);

  if (answerDetail.status !== 200 || !answerDetail.data) {
    throw new Error(answerDetail.message || "问卷答案接口返回异常。");
  }

  const title = answerDetail.data.title || "";
  const items = answerDetail.data.itemList || [];
  let currentSection = "";
  const answers = [];
  for (const item of items) {
    if (item.type === 8) {
      const sectionText = getTextItemContent(item);
      if (isSectionTitle(sectionText)) currentSection = sectionText;
      continue;
    }
    if (!item.question || !item.answer) continue;
    const number = Number.isFinite(item.number) ? item.number + 1 : "";
    answers.push({
      number,
      section: currentSection,
      question: clean(item.question),
      answer: parseAnswer(item),
      required: item.required === 1,
      type: item.type
    });
  }

  return {
    title,
    surveyId: surveyId || answerDetail.data.id,
    answerId,
    suggestedTemplate: suggestTemplate(title),
    answers,
    text: answers.map((item) => {
      const context = item.section ? item.section + " - " : "";
      return String(item.number) + " " + context + item.question.replace(/[：:]\s*$/, "") + ": " + item.answer;
    }).join("\n")
  };
}

async function postWenwo(apiPath, payload, referer) {
  const cleaned = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== ""));
  const response = await fetch(`https://doctor.wenwo.com/medic-h5/v1/api${apiPath}`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "referer": referer,
      "user-agent": "Mozilla/5.0"
    },
    body: JSON.stringify(cleaned)
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`接口返回非 JSON：HTTP ${response.status}`);
  }
}

function parseAnswer(item) {
  let parsed;
  try {
    parsed = JSON.parse(item.answer);
  } catch {
    return clean(item.answer);
  }

  if ([1, 2, 9, 10, 24, 27].includes(item.type)) {
    if (Array.isArray(parsed)) return parsed.map((entry) => entry.content || entry.input || "").filter(Boolean).join("，");
    return clean(parsed.content || parsed.input || "");
  }

  if ([3, 25].includes(item.type)) return clean(parsed.input || "");
  if ([13, 28].includes(item.type)) return clean(parsed.dateTime || "");
  if (item.type === 26) return clean(`${parsed.number || ""}${parsed.unit || ""}`);

  if (item.type === 11) {
    let labels = [];
    try {
      labels = JSON.parse(item.jsonConfig || "{}").inputList?.map((entry) => entry.title) || [];
    } catch {}
    return (Array.isArray(parsed) ? parsed : []).map((entry, index) => {
      const label = labels[index] ? `${labels[index]} ` : "";
      return `${label}${entry.answer || ""}`.trim();
    }).filter(Boolean).join("；");
  }

  if (item.type === 29 && Array.isArray(parsed)) {
    return parsed.map((entry, index) => `${index + 1}.${entry.content || ""}`).join("，");
  }

  if (item.type === 23 && parsed.input) {
    return parsed.input.flatMap((row) => Object.values(row).slice(1)).join("，");
  }

  return clean(Array.isArray(parsed) ? parsed.map((entry) => entry.content || entry.answer || entry).join("，") : JSON.stringify(parsed));
}

function suggestTemplate(title) {
  if (/乳腺癌/.test(title)) return "breast";
  if (/血液肿瘤临床诊疗观察表|骨髓瘤|白血病|淋巴瘤/.test(title)) return "blood";
  return "";
}

function getTextItemContent(item) {
  try {
    return clean(JSON.parse(item.jsonConfig || "{}").text || "");
  } catch {
    return "";
  }
}

function isSectionTitle(value) {
  if (!value) return false;
  if (value.length > 40) return false;
  return /部分|信息|诊断|评估|方案|评价|依从性|不良反应|随访|记录|实践|观点|展望|毒性|管理|治疗/.test(value);
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}
