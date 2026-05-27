import { makeIssue } from "./commonRules.js";
import { includesAny } from "../utils/textUtils.js";
import { toNumber } from "../utils/numberUtils.js";

export function hematologyConditionalCheck(context) {
  const { answers, fieldById, strictness } = context;
  const issues = [];
  if (isMyeloma(answers.diseaseType) && !answers.issStage) {
    issues.push(makeIssue({
      field: fieldById.issStage,
      issueType: "missing",
      severity: strictness === "strict" ? "low" : "medium",
      message: strictness === "strict" ? "MM/多发性骨髓瘤病例建议补充 ISS 分期。" : "MM/多发性骨髓瘤病例应关注 ISS 分期是否缺失。",
      logicReason: "疾病类型提示为 MM/多发性骨髓瘤，ISS 分期字段适用；未识别到对应答案。",
      recommendation: "请确认问卷是否动态跳题，或补充 ISS 分期及依据。",
      evidence: answers.diseaseType,
      ruleId: "hematology.conditional.myelomaIss",
      strictness: ["standard", "strict"]
    }));
  }
  if (strictness !== "strict") return issues;
  if (isLymphoma(answers.diseaseType) && !answers.ipiScore) {
    issues.push(makeIssue({
      field: fieldById.ipiScore,
      issueType: "recommendation",
      severity: "info",
      message: "淋巴瘤病例建议关注 IPI/R-IPI 评分是否填写。",
      logicReason: "疾病类型为 NHL/HL 或淋巴瘤时，严格模式提示预后评分记录完整性。",
      recommendation: "请确认是否适用并补充评分或不适用说明。",
      evidence: answers.diseaseType,
      ruleId: "hematology.conditional.ipi",
      strictness: ["strict"]
    }));
  }
  if (isCml(answers.diseaseType) && !answers.bcrAbl) {
    issues.push(makeIssue({
      field: fieldById.bcrAbl,
      issueType: "recommendation",
      severity: "info",
      message: "CML 病例建议关注 BCR-ABL1 融合记录。",
      logicReason: "疾病类型为 CML 时，严格模式检查关键分子记录完整性。",
      recommendation: "请确认是否填写 BCR-ABL1 检测结果或说明。",
      evidence: answers.diseaseType,
      ruleId: "hematology.conditional.bcrAbl",
      strictness: ["strict"]
    }));
  }
  if (/CAR-?T/i.test(answers.treatmentType || "") && (!answers.crsRecord || !answers.icansRecord)) {
    issues.push(makeIssue({
      field: fieldById.crsRecord,
      issueType: "recommendation",
      severity: "info",
      message: "CAR-T 相关治疗建议关注 CRS/ICANS 记录完整性。",
      logicReason: "治疗类型包含 CAR-T；该规则不要求必须发生不良反应，只提示关注是否记录相关监测。",
      recommendation: "请确认 CRS、ICANS 是否有记录，或注明未发生。",
      evidence: answers.treatmentType,
      ruleId: "hematology.conditional.cartToxicity",
      strictness: ["strict"]
    }));
  }
  if (/移植/.test(answers.treatmentType || "") && !answers.gvhdRecord) {
    issues.push(makeIssue({
      field: fieldById.gvhdRecord,
      issueType: "recommendation",
      severity: "info",
      message: "移植相关病例建议关注 GVHD 记录完整性。",
      logicReason: "治疗类型包含移植；严格模式下提示关注移植相关不良反应监测。",
      recommendation: "请确认 GVHD 是否有记录，或注明不适用/未发生。",
      evidence: answers.treatmentType,
      ruleId: "hematology.conditional.gvhd",
      strictness: ["strict"]
    }));
  }
  return issues;
}

export function hematologyDiseaseSpecificCheck(context) {
  const { answers, fieldById } = context;
  const issues = [];
  if (isMyeloma(answers.diseaseType) && answers.pathologySubtype && answers.issStage) {
    if ((answers.pathologySubtype.includes("ISS I") || answers.pathologySubtype.includes("ISS Ⅰ")) && includesAny(answers.issStage, ["III", "Ⅲ", "3"])) {
      issues.push(makeIssue({
        field: fieldById.issStage,
        issueType: "consistency",
        severity: "high",
        message: "ISS 分期与病理/分型描述不一致。",
        logicReason: "病理/分型描述包含 ISS I，但 ISS 分期字段记录为 III/Ⅲ。",
        recommendation: "请复核 ISS 分期字段和病理分型描述，并补充分期依据。",
        evidence: `病理/分型=${answers.pathologySubtype}；ISS=${answers.issStage}`,
        ruleId: "hematology.diseaseSpecific.issConflict",
        strictness: ["standard", "strict"]
      }));
    }
  }
  if (isMyeloma(answers.diseaseType) && answers.mrdStatus && /阴性/.test(answers.mrdStatus) && !/10\^-?\d|10-\d|灵敏度\s*\d/i.test(answers.mrdStatus)) {
    issues.push(makeIssue({
      field: fieldById.mrdStatus,
      issueType: "recommendation",
      severity: "low",
      message: "MRD 阴性建议注明检测方法和灵敏度。",
      logicReason: "MRD 阴性结果需要检测灵敏度辅助解释；此项为质控完整性提示。",
      recommendation: "请补充检测方法及灵敏度，例如 10^-5 或 10^-6。",
      evidence: answers.mrdStatus,
      ruleId: "hematology.diseaseSpecific.mrd",
      strictness: ["standard", "strict"]
    }));
  }
  if (isMyeloma(answers.diseaseType) && includesAny(answers.myelomaResponse, ["sCR", "CR", "VGPR"]) && isEvidenceStillHigh(answers)) {
    issues.push(makeIssue({
      field: fieldById.myelomaResponse,
      issueType: "consistency",
      severity: "medium",
      message: "骨髓瘤疗效等级与 M蛋白/浆细胞/轻链记录可能不一致。",
      logicReason: "sCR > CR > VGPR > PR，深度缓解通常需要 M蛋白、骨髓浆细胞、轻链等证据同步支持。",
      recommendation: "请复核 M蛋白、骨髓浆细胞比例、游离轻链和疗效评价依据。",
      evidence: `疗效=${answers.myelomaResponse || ""}；M蛋白=${answers.mProtein || ""}；浆细胞=${answers.boneMarrowPlasmaCell || ""}；轻链=${answers.freeLightChain || ""}`,
      ruleId: "hematology.diseaseSpecific.myelomaResponseEvidence",
      strictness: ["standard", "strict"]
    }));
  }
  return issues;
}

export function hematologyConsistencyCheck(context) {
  const { answers, fieldById } = context;
  const issues = [];
  if (/移植/.test(answers.treatmentType || "") && !answers.transplantType) {
    issues.push(makeIssue({
      field: fieldById.transplantType,
      issueType: "missing",
      severity: "medium",
      message: "治疗类型包含移植，但未识别到移植类型。",
      logicReason: "移植类型字段在移植相关病例中适用，用于区分自体/异体移植。",
      recommendation: "请补充移植类型或确认问卷是否未采集该字段。",
      evidence: answers.treatmentType,
      ruleId: "hematology.consistency.transplantType",
      strictness: ["standard", "strict"]
    }));
  }
  if (/是/.test(answers.stopDueToAe || "") && /无|否/.test(answers.adverseEvent || "")) {
    issues.push(makeIssue({
      field: fieldById.adverseEvent,
      issueType: "consistency",
      severity: "medium",
      message: "因副作用停药为“是”，但不良反应记录为无。",
      logicReason: "停药原因与不良反应记录存在信息冲突，应补充不良反应类型和处理措施。",
      recommendation: "请复核不良反应类型、日期、CTCAE 分级和处理。",
      evidence: `停药=${answers.stopDueToAe}；不良反应=${answers.adverseEvent}`,
      ruleId: "hematology.consistency.ae",
      strictness: ["standard", "strict"]
    }));
  }
  if (isLeukemia(answers.diseaseType) && (answers.lymphomaResponse || answers.myelomaResponse)) {
    issues.push(responseMismatch(fieldById.leukemiaResponse, answers, "白血病", "白血病疗效标准"));
  }
  if (isLymphoma(answers.diseaseType) && (answers.leukemiaResponse || answers.myelomaResponse)) {
    issues.push(responseMismatch(fieldById.lymphomaResponse, answers, "淋巴瘤", "淋巴瘤疗效标准"));
  }
  if (isMyeloma(answers.diseaseType) && (answers.leukemiaResponse || answers.lymphomaResponse)) {
    issues.push(responseMismatch(fieldById.myelomaResponse, answers, "骨髓瘤", "骨髓瘤疗效标准"));
  }
  if (isLymphoma(answers.diseaseType) && includesAny(answers.lymphomaResponse, ["CR"]) && /肿大|增大|明显|残留/.test(answers.lymphNodeRegion || "")) {
    issues.push(makeIssue({
      field: fieldById.lymphomaResponse,
      issueType: "consistency",
      severity: "high",
      message: "淋巴瘤疗效为 CR，但仍描述明显肿大淋巴结。",
      logicReason: "CR 通常不应仍有明确活动性病灶描述；可能是残留纤维化、影像描述未更新或疗效评价录入不一致。",
      recommendation: "请复核淋巴结区域描述、PET-CT 结果和疗效评价。",
      evidence: `疗效=${answers.lymphomaResponse || ""}；淋巴结=${answers.lymphNodeRegion || ""}`,
      ruleId: "hematology.consistency.lymphomaCRNode",
      strictness: ["standard", "strict"]
    }));
  }
  if (isLeukemia(answers.diseaseType) && includesAny(answers.leukemiaResponse, ["CR"]) && toNumber(answers.blastPercentage) > 5) {
    issues.push(makeIssue({
      field: fieldById.leukemiaResponse,
      issueType: "consistency",
      severity: "high",
      message: "白血病疗效为 CR，但原始细胞比例明显升高。",
      logicReason: "CR 通常要求骨髓原始细胞比例处于缓解标准范围；当前记录提示需复核。",
      recommendation: "请复核原始细胞比例、骨髓报告和疗效评价。",
      evidence: `疗效=${answers.leukemiaResponse || ""}；原始细胞=${answers.blastPercentage || ""}`,
      ruleId: "hematology.consistency.leukemiaCRBlast",
      strictness: ["standard", "strict"]
    }));
  }
  return issues;
}

function isEvidenceStillHigh(answers) {
  return toNumber(answers.boneMarrowPlasmaCell) >= 5 || /阳性|升高|异常/.test(`${answers.mProtein || ""}${answers.freeLightChain || ""}`);
}

function responseMismatch(field, answers, disease, expected) {
  return makeIssue({
    field,
    issueType: "consistency",
    severity: "medium",
    message: `${disease}病例疑似填写了不匹配的疗效评价字段。`,
    logicReason: `不同疾病类型对应不同疗效标准；当前疾病类型更适合核对 ${expected}。`,
    recommendation: "请复核疾病类型与疗效评价字段是否匹配。",
    evidence: `疾病类型=${answers.diseaseType}；白血病=${answers.leukemiaResponse || ""}；淋巴瘤=${answers.lymphomaResponse || ""}；骨髓瘤=${answers.myelomaResponse || ""}`,
    ruleId: "hematology.consistency.response",
    strictness: ["standard", "strict"]
  });
}

function isMyeloma(value) {
  return /MM|骨髓瘤|多发性骨髓瘤/i.test(value || "");
}

function isLymphoma(value) {
  return /NHL|HL|淋巴瘤|霍奇金/i.test(value || "");
}

function isLeukemia(value) {
  return /AML|ALL|CML|CLL|白血病/i.test(value || "");
}

function isCml(value) {
  return /CML|慢性髓系白血病/i.test(value || "");
}
