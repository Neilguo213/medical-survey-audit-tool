import { calculateBmi, calculateBsa, formatBmi, formatBsa } from "../services/calculationService.js";
import { toDate } from "../utils/dateUtils.js";
import { toNumber } from "../utils/numberUtils.js";

export function requiredCheck(context) {
  const { template, answers, strictness, fieldMap } = context;
  const issues = [];
  for (const field of template.fields) {
    if (!isApplicable(field, context)) continue;
    if (field.requiredLevel === "optional") continue;
    if (field.requiredLevel === "recommended" && strictness !== "strict") continue;
    if (answers[field.fieldId]) continue;

    issues.push(makeIssue({
      field,
      issueType: "missing",
      severity: field.requiredLevel === "required" ? "medium" : "info",
      message: field.requiredLevel === "required" ? "模板关键字段未识别到填写值。" : "严格模式下建议补充该字段。",
      logicReason: field.requiredLevel === "required"
        ? "该字段被标记为 required，且当前解析结果中未找到可确认答案。"
        : "该字段被标记为 recommended；标准模式会减少此类提示，严格模式用于完整性质控。",
      recommendation: "请确认问卷是否动态跳题、题干是否被解析失败，必要时补充或人工映射。",
      evidence: fieldMap[field.fieldId]?.rawQuestion || "未识别到匹配题目",
      ruleId: "common.required",
      strictness: field.requiredLevel === "required" ? ["standard", "strict"] : ["strict"]
    }));
  }
  return issues;
}

export function rangeCheck(context) {
  const { template, answers } = context;
  const issues = [];
  for (const field of template.fields) {
    if (!answers[field.fieldId] || !field.normalRange) continue;
    const value = toNumber(answers[field.fieldId]);
    if (Number.isNaN(value)) continue;
    const { min, max, unit = "" } = field.normalRange;
    if (value < min || value > max) {
      issues.push(makeIssue({
        field,
        issueType: "range",
        severity: "medium",
        message: `当前数值 ${value}${unit} 超出合理范围。`,
        logicReason: `${field.fieldName} 的质控范围为 ${min}-${max}${unit}，超出范围时优先提示复核，不直接判定错误。`,
        recommendation: "请核对单位、录入值和原始病历记录。",
        evidence: answers[field.fieldId],
        ruleId: "common.range",
        strictness: ["standard", "strict"]
      }));
    }
  }
  return issues;
}

export function formatCheck(context) {
  const { template, answers } = context;
  const issues = [];
  for (const field of template.fields) {
    const value = answers[field.fieldId];
    if (!value) continue;
    if (field.fieldType === "number" && Number.isNaN(toNumber(value))) {
      issues.push(makeIssue({
        field,
        issueType: "format",
        severity: "medium",
        message: "该字段应填写数值，但当前无法识别为数字。",
        logicReason: "数值字段需要可解析数字，才能执行范围和计算校验。",
        recommendation: "请检查是否混入文字说明，必要时将说明放入备注字段。",
        evidence: value,
        ruleId: "common.format.number",
        strictness: ["standard", "strict"]
      }));
    }
    if (field.fieldType === "date" && !toDate(value)) {
      issues.push(makeIssue({
        field,
        issueType: "format",
        severity: "medium",
        message: "日期格式无法识别。",
        logicReason: "时间线校验需要完整日期，建议使用 YYYY-MM-DD。",
        recommendation: "请补充完整年月日，或核对复制文本是否遗漏。",
        evidence: value,
        ruleId: "common.format.date",
        strictness: ["standard", "strict"]
      }));
    }
    if (field.options?.length && !optionMatches(value, field.options)) {
      issues.push(makeIssue({
        field,
        issueType: "format",
        severity: "low",
        message: "当前值未与模板选项完全匹配。",
        logicReason: `模板选项包括：${field.options.join("、")}。该提示用于发现同义词、复制异常或选项外录入。`,
        recommendation: "如为同义表述可人工确认；如为录入错误请修正。",
        evidence: value,
        ruleId: "common.format.option",
        strictness: ["strict"]
      }));
    }
  }
  return issues;
}

export function calculationCheck(context) {
  const { template, answers } = context;
  if (template.id === "breast") return checkBmi(context);
  if (template.id === "blood") return checkBsa(context);
  return [];
}

export function timelineCheck(context) {
  const { answers, fieldById } = context;
  const first = toDate(answers.firstVisitDate);
  const baseline = toDate(answers.baselineDate);
  const start = toDate(answers.treatmentStartDate);
  const response = toDate(answers.responseDate);
  const follow = toDate(answers.followUpDate);
  const issues = [];

  if (first && start && start < first) {
    issues.push(makeIssue({
      field: fieldById.treatmentStartDate,
      issueType: "timeline",
      severity: "high",
      message: "治疗开始日期早于首次就诊时间。",
      logicReason: "通常治疗开始不应早于首次就诊；若为院外既往治疗，应在 CRF 中说明。",
      recommendation: "请核对首次就诊时间、治疗开始日期，或补充既往治疗说明。",
      evidence: `首次就诊=${answers.firstVisitDate}；治疗开始=${answers.treatmentStartDate}`,
      ruleId: "common.timeline.firstVisit",
      strictness: ["standard", "strict"]
    }));
  }
  if (baseline && start && start < baseline) {
    issues.push(makeIssue({
      field: fieldById.treatmentStartDate,
      issueType: "timeline",
      severity: "high",
      message: "治疗开始日期早于治疗前评估日期。",
      logicReason: "治疗前评估应在治疗开始之前或同日完成。",
      recommendation: "请核对治疗前评估日期和治疗开始日期。",
      evidence: `治疗前评估=${answers.baselineDate}；治疗开始=${answers.treatmentStartDate}`,
      ruleId: "common.timeline.baseline",
      strictness: ["standard", "strict"]
    }));
  }
  if (start && response && response < start) {
    issues.push(makeIssue({
      field: fieldById.responseDate,
      issueType: "timeline",
      severity: "high",
      message: "疗效评价日期早于治疗开始日期。",
      logicReason: "疗效评价应发生在治疗开始之后。",
      recommendation: "请核对疗效评价日期或治疗开始日期。",
      evidence: `治疗开始=${answers.treatmentStartDate}；疗效评价=${answers.responseDate}`,
      ruleId: "common.timeline.response",
      strictness: ["standard", "strict"]
    }));
  }
  if (start && follow && follow < start) {
    issues.push(makeIssue({
      field: fieldById.followUpDate,
      issueType: "timeline",
      severity: "medium",
      message: "随访日期早于治疗开始日期。",
      logicReason: "随访通常应发生在治疗开始之后；若为治疗前随访记录，建议明确说明。",
      recommendation: "请核对随访日期和治疗开始日期。",
      evidence: `治疗开始=${answers.treatmentStartDate}；随访=${answers.followUpDate}`,
      ruleId: "common.timeline.followUp",
      strictness: ["standard", "strict"]
    }));
  }
  return issues;
}

export function parseWarningCheck(context) {
  return context.parsed.fields
    .filter((field) => field.confidence < 0.72)
    .map((parsed) => makeIssue({
      field: context.fieldById[parsed.fieldId],
      issueType: "parseWarning",
      severity: "info",
      message: "字段识别置信度较低，建议人工确认。",
      logicReason: `该字段通过 ${parsed.matchedBy} 匹配，置信度为 ${Math.round(parsed.confidence * 100)}%。低置信度结果不直接参与判错结论。`,
      recommendation: "请核对题干是否映射到正确字段，必要时手动调整文本。",
      evidence: `${parsed.rawQuestion}: ${parsed.rawAnswer}`,
      ruleId: "common.parse.lowConfidence",
      strictness: ["standard", "strict"]
    }));
}

export function makeIssue({ field, issueType, severity, message, logicReason, recommendation, evidence, ruleId, strictness }) {
  return {
    id: `${ruleId}.${field?.fieldId || "unknown"}.${Math.random().toString(36).slice(2, 8)}`,
    fieldId: field?.fieldId || "",
    fieldName: field?.fieldName || "未识别字段",
    module: field?.module || "其他",
    currentValue: evidence || "",
    issueType,
    severity,
    message,
    logicReason,
    recommendation,
    evidence: evidence || "",
    ruleId,
    strictness
  };
}

export function isApplicable(field, context) {
  if (!field) return false;
  if (typeof field.applicableWhen !== "function") return true;
  try {
    return Boolean(field.applicableWhen(context));
  } catch {
    return false;
  }
}

function checkBmi(context) {
  const { answers, fieldById } = context;
  const height = toNumber(answers.height);
  const weight = toNumber(answers.weight);
  const bmi = toNumber(answers.bmi);
  if ([height, weight, bmi].some(Number.isNaN)) return [];
  const expected = calculateBmi(height, weight);
  if (Math.abs(expected - bmi) <= 0.6) return [];
  return [makeIssue({
    field: fieldById.bmi,
    issueType: "calculation",
    severity: "medium",
    message: `BMI 与身高体重不一致，按公式约为 ${formatBmi(expected)} kg/m²。`,
    logicReason: "BMI = 体重(kg) / 身高(m)^2；允许轻微四舍五入误差。",
    recommendation: "请复核身高、体重、BMI 是否录入一致。",
    evidence: `身高=${answers.height}；体重=${answers.weight}；填写BMI=${answers.bmi}`,
    ruleId: "common.calculation.bmi",
    strictness: ["standard", "strict"]
  })];
}

function checkBsa(context) {
  const { answers, fieldById } = context;
  const height = toNumber(answers.height);
  const weight = toNumber(answers.weight);
  const bsa = toNumber(answers.bsa);
  if ([height, weight, bsa].some(Number.isNaN)) return [];
  const expected = calculateBsa(height, weight);
  if (Math.abs(expected - bsa) <= 0.12) return [];
  return [makeIssue({
    field: fieldById.bsa,
    issueType: "calculation",
    severity: "medium",
    message: `体表面积与身高体重不一致，按 Mosteller 公式约为 ${formatBsa(expected)} m²。`,
    logicReason: "BSA = sqrt(身高cm * 体重kg / 3600)；允许合理录入和四舍五入误差。",
    recommendation: "请复核身高、体重、体表面积是否录入一致。",
    evidence: `身高=${answers.height}；体重=${answers.weight}；填写BSA=${answers.bsa}`,
    ruleId: "common.calculation.bsa",
    strictness: ["standard", "strict"]
  })];
}

function optionMatches(value, options) {
  return options.some((option) => String(value).includes(option) || String(option).includes(value));
}
