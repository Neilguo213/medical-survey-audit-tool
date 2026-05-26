import { makeIssue } from "./commonRules.js";
import { includesAny } from "../utils/textUtils.js";
import { toNumber } from "../utils/numberUtils.js";

export function breastConditionalCheck(context) {
  const { answers, fieldById, strictness } = context;
  if (strictness !== "strict") return [];
  const issues = [];
  if (/HER2\+/.test(answers.molecularSubtype || "") && !answers.targetedTherapy) {
    issues.push(makeIssue({
      field: fieldById.targetedTherapy,
      issueType: "recommendation",
      severity: "info",
      message: "HER2+ 病例建议关注是否填写 HER2 靶向治疗信息。",
      logicReason: "分子分型包含 HER2+，严格模式下检查靶向治疗记录完整性；该规则不判断治疗是否必须使用。",
      recommendation: "请确认 CRF 是否记录 HER2 靶向治疗、未用原因或治疗计划。",
      evidence: answers.molecularSubtype,
      ruleId: "breast.conditional.her2",
      strictness: ["strict"]
    }));
  }
  if (/HER2\+/.test(answers.molecularSubtype || "") && /无|未|否/.test(answers.targetedTherapy || "")) {
    issues.push(makeIssue({
      field: fieldById.targetedTherapy,
      issueType: "recommendation",
      severity: "low",
      message: "HER2+ 且靶向治疗记录为未填写或未使用，建议复核。",
      logicReason: "该提示用于质控信息完整性，不作为临床治疗正确性判断。",
      recommendation: "请确认是否有禁忌、患者拒绝、等待检测或其他说明。",
      evidence: answers.targetedTherapy,
      ruleId: "breast.conditional.her2Absent",
      strictness: ["strict"]
    }));
  }
  if (/HR\+/.test(answers.molecularSubtype || "") && !answers.endocrineTherapy) {
    issues.push(makeIssue({
      field: fieldById.endocrineTherapy,
      issueType: "recommendation",
      severity: "info",
      message: "HR+ 病例建议关注是否填写内分泌治疗信息。",
      logicReason: "分子分型包含 HR+，严格模式下提示关注治疗记录完整性。",
      recommendation: "请确认 CRF 是否记录内分泌治疗、未用原因或治疗计划。",
      evidence: answers.molecularSubtype,
      ruleId: "breast.conditional.hr",
      strictness: ["strict"]
    }));
  }
  return issues;
}

export function breastDiseaseSpecificCheck(context) {
  const { answers, fieldById } = context;
  const issues = [];
  if (/IV|Ⅳ/.test(answers.clinicalStage || "") && !hasMetastasisInfo(answers)) {
    issues.push(makeIssue({
      field: fieldById.metastasisInfo,
      issueType: "missing",
      severity: "low",
      message: "IV期病例建议填写转移相关信息。",
      logicReason: "临床分期为 IV 期时，CRF 通常需要记录骨、肝、肺、脑或其他转移部位以支持分期。",
      recommendation: "请补充转移部位或说明未在当前问卷中采集。",
      evidence: answers.clinicalStage,
      ruleId: "breast.diseaseSpecific.stageIV",
      strictness: ["standard", "strict"]
    }));
  }
  return issues;
}

export function breastConsistencyCheck(context) {
  const { answers, fieldById } = context;
  const issues = [];
  if (includesAny(answers.tnmStage, ["N0"]) && includesAny(answers.nodeStatus, ["阳性"])) {
    issues.push(makeIssue({
      field: fieldById.tnmStage,
      issueType: "consistency",
      severity: "high",
      message: "TNM N0 与淋巴结阳性记录不一致。",
      logicReason: "TNM 中 N0 通常表示区域淋巴结阴性，但淋巴结状态记录为阳性。",
      recommendation: "请复核 TNM 分期、淋巴结状态和阳性数量。",
      evidence: `TNM=${answers.tnmStage}；淋巴结=${answers.nodeStatus}`,
      ruleId: "breast.consistency.node",
      strictness: ["standard", "strict"]
    }));
  }

  const before = toNumber(answers.tumorSizeBefore);
  const after = toNumber(answers.tumorSizeAfter);
  const recist = answers.recist || "";
  if (!Number.isNaN(before) && !Number.isNaN(after)) {
    if (includesAny(recist, ["PR", "部分缓解"]) && after > before) {
      issues.push(makeIssue({
        field: fieldById.recist,
        issueType: "consistency",
        severity: "high",
        message: "RECIST 为 PR，但治疗后肿瘤最大径大于治疗前。",
        logicReason: "PR 通常应体现肿瘤负荷下降；当前最大径方向与疗效评价不一致。",
        recommendation: "请复核 RECIST 评价、测量时间点和肿瘤最大径。",
        evidence: `RECIST=${recist}；治疗前=${answers.tumorSizeBefore}；治疗后=${answers.tumorSizeAfter}`,
        ruleId: "breast.consistency.recistPR",
        strictness: ["standard", "strict"]
      }));
    }
    if (includesAny(recist, ["PD", "进展"]) && after < before) {
      issues.push(makeIssue({
        field: fieldById.recist,
        issueType: "consistency",
        severity: "medium",
        message: "RECIST 为 PD，但治疗后最大径较治疗前缩小，建议复核。",
        logicReason: "PD 与单一最大径变化方向可能不一致，可能存在新病灶或非靶病灶进展，需要人工确认。",
        recommendation: "请补充进展依据或复核 RECIST 结论。",
        evidence: `RECIST=${recist}；治疗前=${answers.tumorSizeBefore}；治疗后=${answers.tumorSizeAfter}`,
        ruleId: "breast.consistency.recistPD",
        strictness: ["standard", "strict"]
      }));
    }
    if (includesAny(recist, ["CR", "完全缓解"]) && after > 0) {
      issues.push(makeIssue({
        field: fieldById.recist,
        issueType: "consistency",
        severity: "medium",
        message: "RECIST 为 CR，但仍记录明确肿瘤残留，建议复核。",
        logicReason: "CR 通常要求目标病灶消失；若仍有残留最大径，需要确认是否为非活性残留或录入问题。",
        recommendation: "请复核影像结论和最大径记录。",
        evidence: `RECIST=${recist}；治疗后=${answers.tumorSizeAfter}`,
        ruleId: "breast.consistency.recistCR",
        strictness: ["standard", "strict"]
      }));
    }
  }
  if (/是/.test(answers.stopDueToAe || "") && /无|否/.test(answers.adverseEvent || "")) {
    issues.push(makeIssue({
      field: fieldById.adverseEvent,
      issueType: "consistency",
      severity: "medium",
      message: "因副作用停药为“是”，但不良反应记录为无。",
      logicReason: "停药原因与不良反应记录存在信息冲突，应补充不良反应类型和处理措施。",
      recommendation: "请复核是否填写不良反应类型、日期、分级和处理。",
      evidence: `停药=${answers.stopDueToAe}；不良反应=${answers.adverseEvent}`,
      ruleId: "breast.consistency.ae",
      strictness: ["standard", "strict"]
    }));
  }
  return issues;
}

function hasMetastasisInfo(answers) {
  const text = `${answers.metastasisInfo || ""}${answers.tnmStage || ""}`;
  return /骨|肝|肺|脑|转移|M1/i.test(text);
}
