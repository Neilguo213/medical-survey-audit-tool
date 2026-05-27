import { calculateBmi, calculateBsa, formatBmi, formatBsa } from "../services/calculationService.js";
import { toDate } from "../utils/dateUtils.js";
import { toNumber } from "../utils/numberUtils.js";
import { isFieldApplicable } from "../conditions/applicability.js";
import { diseaseLabel, diseaseInScope } from "../disease-maps/hematologyDiseaseMap.js";
import { isEmptyValue, optionMatches as valueOptionMatches } from "../validators/valueValidators.js";
import { validateDrugDose } from "../validators/drugDoseValidator.js";

export function requiredCheck(context) {
  const { template, answers, strictness, fieldMap } = context;
  const issues = [];
  for (const field of template.fields) {
    if (!isApplicable(field, context)) continue;
    if (!field.required && field.requiredLevel === "optional") continue;
    if (!field.required && field.requiredLevel === "recommended" && strictness !== "strict") continue;
    if (!isEmptyValue(answers[field.fieldId])) continue;

    issues.push(makeIssue({
      field,
      issueType: "missing",
      severity: field.required ? "medium" : "info",
      message: field.required ? "模板关键字段未识别到填写值。" : "严格模式下建议补充该字段。",
      logicReason: field.required
        ? "该字段被标记为 required，且 applicableIf 和 diseaseScope 均满足，当前解析结果中未找到可确认答案。"
        : "该字段被标记为 recommended；标准模式会减少此类提示，严格模式用于完整性质控。",
      recommendation: "请确认问卷是否动态跳题、题干是否被解析失败，必要时补充或人工映射。",
      evidence: fieldMap[field.fieldId]?.rawQuestion || "未识别到匹配题目",
      ruleId: "common.required",
      strictness: field.required ? ["standard", "strict"] : ["strict"]
    }));
  }
  return issues;
}

export function rangeCheck(context) {
  const { template, answers } = context;
  const issues = [];
  for (const field of template.fields) {
    if (isEmptyValue(answers[field.fieldId]) || !field.normalRange) continue;
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
    if (isEmptyValue(value)) continue;
    if (["number", "percentage", "lab", "score"].includes(field.type || field.fieldType) && Number.isNaN(toNumber(value))) {
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
    if (["date", "timelineDate"].includes(field.type || field.fieldType) && !toDate(value)) {
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
    if (field.options?.length && !valueOptionMatches(value, field.options)) {
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

export function applicabilityCheck(context) {
  const { template, answers, fieldMap } = context;
  const issues = [];
  for (const field of template.fields) {
    const parsed = fieldMap[field.fieldId];
    if (!parsed || isEmptyValue(answers[field.fieldId]) || isApplicable(field, context)) continue;
    if (field.diseaseScope?.length && !diseaseInScope(answers.diseaseType, field.diseaseScope)) {
      issues.push(makeIssue({
        field,
        issueType: "consistency",
        severity: "high",
        message: "当前疾病类型可能不适用该字段或评分系统。",
        logicReason: `${field.fieldName} 主要适用于 ${field.diseaseScope.map(diseaseLabel).join("、")}；当前疾病类型为 ${answers.diseaseType || "未识别"}。`,
        recommendation: "请确认疾病类型是否正确，或删除/说明该字段为何适用于当前病例。",
        evidence: `${parsed.rawQuestion}: ${parsed.rawAnswer}`,
        ruleId: "common.applicability.diseaseScope",
        strictness: ["standard", "strict"]
      }));
    }
  }
  return issues;
}

export function drugDoseCheck(context) {
  const { template, answers } = context;
  const issues = [];
  for (const field of template.fields) {
    if ((field.validator !== "drugDose" && (field.type || field.fieldType) !== "drugDose") || isEmptyValue(answers[field.fieldId])) continue;
    const result = validateDrugDose(answers[field.fieldId]);
    if (!result) continue;
    issues.push(makeIssue({
      field,
      issueType: "format",
      severity: "medium",
      message: result.message,
      logicReason: result.reason,
      recommendation: "请补充具体药物、剂量、频次或周期；无法确认时建议人工复核原始病历。",
      evidence: answers[field.fieldId],
      ruleId: `common.drugDose.${result.code}`,
      strictness: ["standard", "strict"]
    }));
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
  const diagnosis = toDate(answers.diagnosisDate) || first;
  const baseline = toDate(answers.baselineDate);
  const start = toDate(answers.treatmentStartDate);
  const response = toDate(answers.responseDate);
  const follow = toDate(answers.followUpDate);
  const aeDate = toDate(answers.adverseEventDate);
  const deathDate = toDate(answers.deathDate);
  const relapseDate = toDate(answers.relapseDate);
  const issues = [];

  if (diagnosis && start && start < diagnosis) {
    issues.push(makeIssue({
      field: fieldById.treatmentStartDate,
      issueType: "timeline",
      severity: "high",
      message: "治疗开始日期早于确诊/首次就诊时间。",
      logicReason: "通用时间线要求：确诊日期 <= 治疗开始日期 <= 疗效评估日期 <= 随访日期。",
      recommendation: "请核对确诊日期、首次就诊时间、治疗开始日期，或补充院外既往治疗说明。",
      evidence: `确诊/首次就诊=${answers.diagnosisDate || answers.firstVisitDate}；治疗开始=${answers.treatmentStartDate}`,
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
  if (start && aeDate && aeDate < start) {
    issues.push(makeIssue({
      field: fieldById.adverseEventDate,
      issueType: "timeline",
      severity: "high",
      message: "不良反应日期早于治疗开始日期。",
      logicReason: "不良反应监测记录通常应发生在相关治疗开始之后。",
      recommendation: "请核对不良反应日期、治疗开始日期及是否为既往治疗相关事件。",
      evidence: `治疗开始=${answers.treatmentStartDate}；不良反应=${answers.adverseEventDate}`,
      ruleId: "common.timeline.adverseEvent",
      strictness: ["standard", "strict"]
    }));
  }
  if (diagnosis && deathDate && deathDate < diagnosis) {
    issues.push(makeIssue({
      field: fieldById.deathDate,
      issueType: "timeline",
      severity: "high",
      message: "死亡日期早于确诊/首次就诊日期。",
      logicReason: "死亡日期不应早于当前病例诊断或首次就诊时间。",
      recommendation: "请核对死亡日期和确诊日期。",
      evidence: `确诊/首次就诊=${answers.diagnosisDate || answers.firstVisitDate}；死亡=${answers.deathDate}`,
      ruleId: "common.timeline.death",
      strictness: ["standard", "strict"]
    }));
  }
  if (start && relapseDate && relapseDate < start) {
    issues.push(makeIssue({
      field: fieldById.relapseDate,
      issueType: "timeline",
      severity: "high",
      message: "复发日期早于治疗开始日期。",
      logicReason: "复发记录通常应发生在治疗开始之后。",
      recommendation: "请核对复发日期、治疗开始日期和病例治疗阶段。",
      evidence: `治疗开始=${answers.treatmentStartDate}；复发=${answers.relapseDate}`,
      ruleId: "common.timeline.relapse",
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
  return isFieldApplicable(field, context);
}

function checkBmi(context) {
  const { answers, fieldById } = context;
  const height = toNumber(answers.height);
  const weight = toNumber(answers.weight);
  const bmi = toNumber(answers.bmi);
  if ([height, weight, bmi].some(Number.isNaN)) return [];
  const expected = calculateBmi(height, weight);
  if (Math.abs(expected - bmi) <= 0.3) return [];
  return [makeIssue({
    field: fieldById.bmi,
    issueType: "calculation",
    severity: "medium",
    message: `BMI计算值与填写值不一致，按公式约为 ${formatBmi(expected)} kg/m²。`,
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
  if (Math.abs(expected - bsa) <= 0.15) return [];
  return [makeIssue({
    field: fieldById.bsa,
    issueType: "calculation",
    severity: "medium",
    message: `体表面积计算值与填写值不一致，按 Mosteller 公式约为 ${formatBsa(expected)} m²。`,
    logicReason: "BSA = sqrt(身高cm * 体重kg / 3600)；允许合理录入和四舍五入误差。",
    recommendation: "请复核身高、体重、体表面积是否录入一致。",
    evidence: `身高=${answers.height}；体重=${answers.weight}；填写BSA=${answers.bsa}`,
    ruleId: "common.calculation.bsa",
    strictness: ["standard", "strict"]
  })];
}
