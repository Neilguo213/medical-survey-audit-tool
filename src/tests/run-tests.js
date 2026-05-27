import assert from "node:assert/strict";
import { parseCase } from "../services/parserService.js";
import { matchField } from "../services/fieldMatcher.js";
import { auditCase } from "../services/auditEngine.js";
import { calculateBmi, calculateBsa } from "../services/calculationService.js";
import { templates } from "../templates/index.js";

const tests = [];

test("parseCase 支持题干:答案格式", () => {
  const parsed = parseCase("5 身高: 153\n6 体重: 51", templates.breast);
  assert.equal(parsed.answers.height, "153");
  assert.equal(parsed.answers.weight, "51");
});

test("parseCase 支持题干和答案分行", () => {
  const parsed = parseCase("分子分型\nHR+/HER2+\nRECIST\nPR", templates.breast);
  assert.equal(parsed.answers.molecularSubtype, "HR+/HER2+");
  assert.equal(parsed.answers.recist, "PR");
});

test("parseCase 支持多选答案文本", () => {
  const parsed = parseCase("细胞遗传学/分子生物学异常: ☑ 1q21 ☑ del17p", templates.blood);
  assert.match(parsed.answers.molecularFinding, /1q21/);
  assert.match(parsed.answers.molecularFinding, /del17p/);
});

test("parseCase 保留未匹配题目", () => {
  const parsed = parseCase("神秘字段: abc", templates.breast);
  assert.equal(parsed.unmatchedItems.length, 1);
});

test("parseCase 支持题目+空格+答案", () => {
  const parsed = parseCase("身高 153\n体重 51", templates.breast);
  assert.equal(parsed.answers.height, "153");
  assert.equal(parsed.answers.weight, "51");
});

test("parseCase 支持表格复制文本", () => {
  const parsed = parseCase("化疗方案\t紫杉醇 80mg 每周", templates.breast);
  assert.equal(parsed.answers.chemotherapyRegimen, "紫杉醇 80mg 每周");
});

test("fieldMatcher 支持 aliases 匹配", () => {
  const match = matchField("患者身高(cm)", templates.blood);
  assert.equal(match.field.fieldId, "height");
  assert.ok(match.confidence >= 0.7);
});

test("fieldMatcher 支持低置信度模糊匹配", () => {
  const match = matchField("疗效评价时间", templates.breast);
  assert.equal(match.field.fieldId, "responseDate");
  assert.ok(match.confidence < 1);
});

test("calculation 计算 BMI 和 BSA", () => {
  assert.ok(Math.abs(calculateBmi(153, 51) - 21.8) < 0.1);
  assert.ok(Math.abs(calculateBsa(173, 65) - 1.78) < 0.02);
});

test("auditEngine HER2+ 严格模式触发靶向治疗复核", () => {
  const parsed = parseCase("分子分型: HR+/HER2+\n治疗开始时间: 2026-03-01\n首次就诊时间: 2026-02-01\n评估日期: 2026-04-01", templates.breast);
  const audit = auditCase({ template: templates.breast, parsed, strictness: "strict" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "breast.conditional.her2"));
});

test("auditEngine MM 标准模式触发 ISS 关注", () => {
  const parsed = parseCase("疾病类型: 多发性骨髓瘤\n治疗类型: 化疗\n首次就诊时间: 2026-02-01\n治疗开始日期: 2026-03-01\n疗效评估日期: 2026-04-01", templates.blood);
  const audit = auditCase({ template: templates.blood, parsed, strictness: "standard" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "hematology.conditional.myelomaIss"));
});

test("auditEngine 淋巴瘤严格模式触发 IPI/R-IPI 关注", () => {
  const parsed = parseCase("疾病类型: NHL\n治疗类型: 化疗\n首次就诊时间: 2026-02-01\n治疗开始日期: 2026-03-01\n疗效评估日期: 2026-04-01", templates.blood);
  const audit = auditCase({ template: templates.blood, parsed, strictness: "strict" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "hematology.conditional.ipi"));
});

test("auditEngine PR 但肿瘤增大触发逻辑冲突", () => {
  const parsed = parseCase("分子分型: 三阴性\n临床分期: II期\n首次就诊时间: 2026-02-01\n治疗开始时间: 2026-03-01\n评估日期: 2026-04-01\nRECIST: PR\n治疗前肿瘤最大径: 2\n治疗后肿瘤最大径: 3", templates.breast);
  const audit = auditCase({ template: templates.breast, parsed, strictness: "standard" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "breast.consistency.recistPR"));
});

test("auditEngine 动态跳题不适用字段不提示缺失", () => {
  const parsed = parseCase("疾病类型: AML\n治疗类型: 化疗\n首次就诊时间: 2026-02-01\n治疗开始日期: 2026-03-01\n疗效评估日期: 2026-04-01", templates.blood);
  const audit = auditCase({ template: templates.blood, parsed, strictness: "strict" });
  assert.ok(!audit.issues.some((issue) => issue.fieldId === "issStage" && issue.issueType === "missing"));
});

test("auditEngine 药物无剂量触发需复核", () => {
  const parsed = parseCase("化疗方案: 紫杉醇\n分子分型: 三阴性\n临床分期: II期\n首次就诊时间: 2026-02-01\n治疗开始时间: 2026-03-01\n评估日期: 2026-04-01\nRECIST: PR", templates.breast);
  const audit = auditCase({ template: templates.breast, parsed, strictness: "standard" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "common.drugDose.missingDose"));
});

test("auditEngine 笼统治疗方案触发具体药物提示", () => {
  const parsed = parseCase("联合用药: 联合方案\n疾病类型: MM\n治疗类型: 化疗\n首次就诊时间: 2026-02-01\n治疗开始日期: 2026-03-01\n疗效评估日期: 2026-04-01", templates.blood);
  const audit = auditCase({ template: templates.blood, parsed, strictness: "standard" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "common.drugDose.vagueTreatment"));
});

test("auditEngine 非淋巴瘤填写 IPI 触发疾病不适配", () => {
  const parsed = parseCase("疾病类型: 多发性骨髓瘤\nIPI评分: 3\n治疗类型: 化疗\n首次就诊时间: 2026-02-01\n治疗开始日期: 2026-03-01\n疗效评估日期: 2026-04-01", templates.blood);
  const audit = auditCase({ template: templates.blood, parsed, strictness: "standard" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "common.applicability.diseaseScope"));
});

test("auditEngine 不良反应日期早于治疗开始触发时间线冲突", () => {
  const parsed = parseCase("疾病类型: AML\n治疗类型: 化疗\n首次就诊时间: 2026-02-01\n治疗开始日期: 2026-03-01\n疗效评估日期: 2026-04-01\n是否出现不良反应: 有\n不良反应日期: 2026-02-20", templates.blood);
  const audit = auditCase({ template: templates.blood, parsed, strictness: "standard" });
  assert.ok(audit.issues.some((issue) => issue.ruleId === "common.timeline.adverseEvent"));
});

for (const item of tests) {
  item.fn();
  console.log(`✓ ${item.name}`);
}

console.log(`\n${tests.length} tests passed.`);

function test(name, fn) {
  tests.push({ name, fn });
}
