const VAGUE_TREATMENT_TERMS = ["化疗", "靶向", "免疫治疗", "联合方案", "联合治疗", "支持治疗", "维持治疗", "方案"];
const DOSE_PATTERN = /(\d+(?:\.\d+)?\s*(?:mg\/m2|mg\/m²|mg|g|IU|iu|U|ml|mL|μg|ug)|\b(?:qd|bid|tid|q\d+w|q\d+d)\b|d\d+\s*[-~至]\s*d\d+|每周|每\d+天|每21天|每28天)/i;
const COMMON_DRUGS = [
  "曲妥珠单抗", "帕妥珠单抗", "T-DXd", "DS-8201", "紫杉醇", "多西他赛", "卡培他滨", "环磷酰胺", "表柔比星", "阿霉素",
  "来曲唑", "阿那曲唑", "他莫昔芬", "氟维司群", "戈舍瑞林", "帕博利珠单抗", "纳武利尤单抗",
  "硼替佐米", "来那度胺", "地塞米松", "马法兰", "伊沙佐米", "达雷妥尤单抗", "伊布替尼", "维奈克拉", "阿扎胞苷",
  "利妥昔单抗", "环孢素", "甲氨蝶呤", "阿昔洛韦", "伏立康唑", "亚胺培南", "美罗培南"
];

export function analyzeDrugDose(value) {
  const text = String(value || "").trim();
  const hasDose = DOSE_PATTERN.test(text);
  const drugNames = extractDrugNames(text);
  const vagueOnly = isVagueOnly(text, drugNames, hasDose);
  const describesCombination = /联合|联合用药|联合治疗|联合方案|\+|、|,|，/.test(text);
  return {
    text,
    hasDose,
    hasDrug: drugNames.length > 0,
    drugNames,
    drugCount: drugNames.length,
    vagueOnly,
    describesCombination
  };
}

export function validateDrugDose(value) {
  const analysis = analyzeDrugDose(value);
  if (!analysis.text) return null;
  if (analysis.vagueOnly) {
    return {
      code: "vagueTreatment",
      message: "治疗方案描述过于笼统，请补充具体药物。",
      reason: "当前仅识别到治疗类别或方案描述，未识别到具体药物名称。"
    };
  }
  if (analysis.hasDrug && !analysis.hasDose) {
    return {
      code: "missingDose",
      message: "已识别药物名称，但未识别剂量信息，请补充剂量/频次/周期。",
      reason: "药物字段应尽量包含剂量、频次或周期，例如 mg、mg/m²、qd、q3w、d1-d14、每21天。"
    };
  }
  if (!analysis.hasDrug && analysis.hasDose) {
    return {
      code: "missingDrug",
      message: "存在剂量描述，但未识别药物名称。",
      reason: "剂量信息需要对应明确药物，否则无法判断治疗方案是否完整。"
    };
  }
  if (analysis.describesCombination && analysis.drugCount === 1) {
    return {
      code: "incompleteCombination",
      message: "当前描述为联合治疗，但仅识别到一种药物，请复核。",
      reason: "联合治疗通常应包含两个或以上药物或治疗组成。"
    };
  }
  return null;
}

function extractDrugNames(text) {
  const found = COMMON_DRUGS.filter((name) => new RegExp(escapeRegExp(name), "i").test(text));
  const genericMatches = text.match(/[\u4e00-\u9fa5A-Za-z0-9-]*(?:单抗|替尼|珠单抗|昔芬|紫杉醇|环磷酰胺|地塞米松|马法兰|阿霉素|他滨|泊苷|铂|CAR-?T)[\u4e00-\u9fa5A-Za-z0-9-]*/gi) || [];
  return [...new Set([...found, ...genericMatches].filter((name) => !VAGUE_TREATMENT_TERMS.includes(name)))];
}

function isVagueOnly(text, drugNames, hasDose) {
  if (drugNames.length || hasDose) return false;
  return VAGUE_TREATMENT_TERMS.some((term) => text.includes(term));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
