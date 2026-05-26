import { templates } from "./src/templates/index.js";
import { parseCase } from "./src/services/parserService.js";
import { auditCase } from "./src/services/auditEngine.js";
import { escapeHtml } from "./src/utils/textUtils.js";

let currentParsed = null;
let currentAudit = null;

const templateSelect = document.querySelector("#templateSelect");
const strictnessSelect = document.querySelector("#strictnessSelect");
const caseInput = document.querySelector("#caseInput");
const surveyUrlInput = document.querySelector("#surveyUrlInput");
const extractUrlBtn = document.querySelector("#extractUrlBtn");
const linkStatus = document.querySelector("#linkStatus");
const auditBtn = document.querySelector("#auditBtn");
const loadSampleBtn = document.querySelector("#loadSampleBtn");
const clearBtn = document.querySelector("#clearBtn");
const copyReportBtn = document.querySelector("#copyReportBtn");
const exportMarkdownBtn = document.querySelector("#exportMarkdownBtn");
const exportJsonBtn = document.querySelector("#exportJsonBtn");
const recognizedCount = document.querySelector("#recognizedCount");
const recognizedList = document.querySelector("#recognizedList");
const unmatchedCount = document.querySelector("#unmatchedCount");
const unmatchedList = document.querySelector("#unmatchedList");
const highCount = document.querySelector("#highCount");
const mediumCount = document.querySelector("#mediumCount");
const lowCount = document.querySelector("#lowCount");
const auditStatus = document.querySelector("#auditStatus");
const resultBody = document.querySelector("#resultBody");
const ruleCount = document.querySelector("#ruleCount");
const rulesList = document.querySelector("#rulesList");

templateSelect.addEventListener("change", () => {
  renderRules();
  parseAndRender(false);
});
strictnessSelect.addEventListener("change", () => runAudit());
extractUrlBtn.addEventListener("click", extractFromUrl);
caseInput.addEventListener("input", () => parseAndRender(false));
auditBtn.addEventListener("click", runAudit);
loadSampleBtn.addEventListener("click", () => {
  caseInput.value = getTemplate().sample;
  runAudit();
});
clearBtn.addEventListener("click", () => {
  caseInput.value = "";
  currentParsed = null;
  currentAudit = null;
  parseAndRender(true);
});
copyReportBtn.addEventListener("click", async () => copyText(buildMarkdownReport()));
exportMarkdownBtn.addEventListener("click", () => downloadText(buildMarkdownReport(), "audit-report.md", "text/markdown"));
exportJsonBtn.addEventListener("click", () => downloadText(JSON.stringify(buildExportPayload(), null, 2), "audit-report.json", "application/json"));

recognizedList.addEventListener("input", (event) => {
  const input = event.target.closest("[data-field-id]");
  if (!input || !currentParsed) return;
  currentParsed.answers[input.dataset.fieldId] = input.value.trim();
  const item = currentParsed.fields.find((field) => field.fieldId === input.dataset.fieldId);
  if (item) item.normalizedValue = input.value.trim();
  runAuditWithParsed();
});

unmatchedList.addEventListener("change", (event) => {
  const select = event.target.closest("[data-unmatched-index]");
  if (!select || !select.value || !currentParsed) return;
  const item = currentParsed.unmatchedItems[Number(select.dataset.unmatchedIndex)];
  const field = getTemplate().fields.find((entry) => entry.fieldId === select.value);
  if (!item || !field) return;
  currentParsed.fields.push({
    fieldId: field.fieldId,
    fieldName: field.fieldName,
    module: field.module,
    rawQuestion: item.rawQuestion,
    rawAnswer: item.rawAnswer,
    normalizedValue: item.rawAnswer,
    confidence: 0.7,
    source: "manual",
    matchedBy: "manual"
  });
  currentParsed.answers[field.fieldId] = item.rawAnswer;
  currentParsed.unmatchedItems.splice(Number(select.dataset.unmatchedIndex), 1);
  renderParsed(currentParsed);
  runAuditWithParsed();
});

renderRules();
parseAndRender(true);

function getTemplate() {
  return templates[templateSelect.value];
}

function parseAndRender(showEmptyResults) {
  currentParsed = parseCase(caseInput.value, getTemplate());
  renderParsed(currentParsed);
  if (showEmptyResults) renderResults(null);
}

function runAudit() {
  currentParsed = parseCase(caseInput.value, getTemplate());
  renderParsed(currentParsed);
  runAuditWithParsed();
}

function runAuditWithParsed() {
  currentAudit = auditCase({
    template: getTemplate(),
    parsed: currentParsed,
    strictness: strictnessSelect.value
  });
  renderResults(currentAudit);
}

async function extractFromUrl() {
  const url = surveyUrlInput.value.trim();
  if (!url) {
    linkStatus.textContent = "请先粘贴问卷链接。";
    return;
  }
  linkStatus.textContent = "正在读取链接...";
  extractUrlBtn.disabled = true;
  try {
    const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || "读取失败");
    if (data.suggestedTemplate && templates[data.suggestedTemplate]) {
      templateSelect.value = data.suggestedTemplate;
      renderRules();
    }
    caseInput.value = data.text;
    linkStatus.textContent = `已读取：${data.title || "问卷"}，${data.answers.length} 个答案。`;
    runAudit();
  } catch (error) {
    linkStatus.textContent = `读取失败：${error.message}`;
  } finally {
    extractUrlBtn.disabled = false;
  }
}

function renderParsed(parsed) {
  const grouped = groupBy(parsed.fields, "module");
  recognizedCount.textContent = `${parsed.fields.length} 项`;
  recognizedList.innerHTML = parsed.fields.length
    ? Object.entries(grouped).map(([module, fields]) => (
      `<details class="module-group" open>
        <summary>${escapeHtml(module)} <span>${fields.length} 项</span></summary>
        ${fields.map(renderFieldItem).join("")}
      </details>`
    )).join("")
    : `<div class="empty">尚未识别到题目。</div>`;

  unmatchedCount.textContent = `${parsed.unmatchedItems.length} 项`;
  unmatchedList.innerHTML = parsed.unmatchedItems.length
    ? parsed.unmatchedItems.map((item, index) => renderUnmatchedItem(item, index)).join("")
    : `<div class="empty">没有未匹配内容。</div>`;
}

function renderFieldItem(item) {
  const confidence = Math.round(item.confidence * 100);
  const low = item.confidence < 0.72 ? " low-confidence" : "";
  return `<div class="recognized-item${low}">
    <strong>${escapeHtml(item.fieldName)} <span>${confidence}% · ${escapeHtml(item.matchedBy)}</span></strong>
    <label>
      <span>${escapeHtml(item.rawQuestion)}</span>
      <input data-field-id="${escapeHtml(item.fieldId)}" value="${escapeHtml(item.normalizedValue)}" />
    </label>
  </div>`;
}

function renderUnmatchedItem(item, index) {
  const options = getTemplate().fields.map((field) => (
    `<option value="${escapeHtml(field.fieldId)}">${escapeHtml(field.module)} - ${escapeHtml(field.fieldName)}</option>`
  )).join("");
  return `<div class="unmatched-item">
    <strong>${escapeHtml(item.rawQuestion)}</strong>
    <span>${escapeHtml(item.rawAnswer)}</span>
    <select data-unmatched-index="${index}">
      <option value="">人工映射到字段...</option>
      ${options}
    </select>
  </div>`;
}

function renderResults(audit) {
  if (!audit) {
    highCount.textContent = "0";
    mediumCount.textContent = "0";
    lowCount.textContent = "0";
    auditStatus.textContent = "待审核";
    resultBody.innerHTML = `<tr><td colspan="5" class="empty">点击“开始审核”后展示审核意见。</td></tr>`;
    return;
  }
  const stats = audit.stats;
  highCount.textContent = stats.critical + stats.high;
  mediumCount.textContent = stats.medium;
  lowCount.textContent = stats.low + stats.info;
  auditStatus.textContent = stats.critical || stats.high ? "建议复核" : stats.medium ? "需补充" : "未见明显问题";
  resultBody.innerHTML = audit.issues.length
    ? Object.entries(audit.groupedIssues).map(([module, issues]) => (
      `<tr class="module-row"><td colspan="5">${escapeHtml(module)}</td></tr>${issues.map(renderIssueRow).join("")}`
    )).join("")
    : `<tr><td colspan="5" class="empty">未发现明显规则问题。</td></tr>`;
}

function renderIssueRow(item) {
  return `<tr>
    <td><span class="badge ${item.severity}">${severityName(item.severity)}</span></td>
    <td>${escapeHtml(item.fieldName)}</td>
    <td>${escapeHtml(item.currentValue)}</td>
    <td>${escapeHtml(issueTypeName(item.issueType))}</td>
    <td>
      <strong>${escapeHtml(item.message)}</strong>
      <p>${escapeHtml(item.logicReason)}</p>
      <p>${escapeHtml(item.recommendation)}</p>
    </td>
  </tr>`;
}

function renderRules() {
  const template = getTemplate();
  ruleCount.textContent = `${template.fields.length} 个字段`;
  const grouped = groupBy(template.fields, "module");
  rulesList.innerHTML = Object.entries(grouped).map(([module, fields]) => (
    `<details class="module-group" open>
      <summary>${escapeHtml(module)} <span>${fields.length} 项</span></summary>
      ${fields.map((item) => `<div class="rule-item"><strong>${escapeHtml(item.fieldName)}</strong><span>${escapeHtml(item.requiredLevel)} · ${escapeHtml(item.fieldType)}${item.unit ? ` · ${escapeHtml(item.unit)}` : ""}</span></div>`).join("")}
    </details>`
  )).join("");
}

function buildExportPayload() {
  return {
    auditTime: new Date().toISOString(),
    templateName: getTemplate().name,
    strictness: strictnessSelect.value,
    recognizedFields: currentParsed?.fields || [],
    unmatchedItems: currentParsed?.unmatchedItems || [],
    issues: currentAudit?.issues || [],
    stats: currentAudit?.stats || {}
  };
}

function buildMarkdownReport() {
  const payload = buildExportPayload();
  const lines = [
    "# 病例问卷审核报告",
    "",
    `- 审核时间：${payload.auditTime}`,
    `- 模板：${payload.templateName}`,
    `- 审核严格度：${payload.strictness}`,
    `- 风险统计：critical ${payload.stats.critical || 0} / high ${payload.stats.high || 0} / medium ${payload.stats.medium || 0} / low ${payload.stats.low || 0} / info ${payload.stats.info || 0}`,
    "",
    "## 字段识别结果",
    ...payload.recognizedFields.map((field) => `- ${field.module} / ${field.fieldName}：${field.normalizedValue}（${Math.round(field.confidence * 100)}%，${field.matchedBy}）`),
    "",
    "## 未匹配题目",
    ...(payload.unmatchedItems.length ? payload.unmatchedItems.map((item) => `- ${item.rawQuestion}：${item.rawAnswer}`) : ["- 无"]),
    "",
    "## 审核意见",
    ...(payload.issues.length ? payload.issues.map((issue) => `- [${severityName(issue.severity)}] ${issue.module} / ${issue.fieldName}：${issue.message}\n  - 依据：${issue.logicReason}\n  - 建议：${issue.recommendation}`) : ["- 未发现明显规则问题"])
  ];
  return lines.join("\n");
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  copyReportBtn.textContent = "已复制";
  setTimeout(() => copyReportBtn.textContent = "复制报告", 1200);
}

function downloadText(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const group = item[key] || "其他";
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});
}

function severityName(level) {
  return { critical: "严重", high: "高风险", medium: "需复核", low: "提示", info: "信息" }[level] ?? level;
}

function issueTypeName(type) {
  return {
    missing: "缺失",
    range: "范围",
    format: "格式",
    timeline: "时间线",
    calculation: "计算",
    consistency: "一致性",
    recommendation: "建议",
    parseWarning: "解析提示"
  }[type] ?? type;
}
