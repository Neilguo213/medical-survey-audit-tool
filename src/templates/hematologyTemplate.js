import { applies } from "../conditions/applicability.js";

export const hematologyTemplate = {
  id: "blood",
  name: "血液肿瘤 CRF",
  sample: `1 首次就诊时间: 2026-03-24
3 年龄: 57
4 性别: 男
5 患者身高(cm): 173
6 患者体重(kg): 65
7 体表面积(m²): 2
15 疾病类型: 多发性骨髓瘤（MM）
16 病理亚型/分型: 多发性骨髓瘤 ISS I期 R-ISS III期
20 ISS分期: Ⅲ期
21 评估日期: 2026-03-24
22 ECOG评分: 0
Hb: 134
WBC: 5
PLT: 98
ANC: 3
36 治疗类型: 造血干细胞移植
37 移植类型: 自体移植
移植预处理: 马法兰
39 治疗开始日期: 2025-10-24
41 疗效评估日期: 2026-03-24
44 骨髓瘤疗效: 严格意义的完全缓解（sCR）
45 MRD状态: 阴性（灵敏度）
50 是否因副作用停药: 是
53 是否出现不良反应: 无
54 随访日期: 2026-05-23`,
  fields: [
    field("firstVisitDate", "首次就诊时间", "患者基本信息", "date", "required", ["首次就诊日期", "首诊时间"]),
    field("diagnosisDate", "确诊日期", "疾病诊断", "timelineDate", "recommended", ["诊断日期", "病理确诊日期"]),
    field("patientInitials", "患者姓名首字母缩写", "患者基本信息", "text", "optional", ["姓名首字母", "首字母缩写"]),
    field("age", "年龄", "患者基本信息", "number", "required", ["患者年龄"], { normalRange: { min: 0, max: 120, unit: "岁" } }),
    field("sex", "性别", "患者基本信息", "enum", "required", ["患者性别"], { options: ["男", "女"] }),
    field("height", "患者身高", "患者基本信息", "number", "required", ["身高", "身高(cm)", "患者身高(cm)"], { unit: "cm", normalRange: { min: 100, max: 230, unit: "cm" } }),
    field("weight", "患者体重", "患者基本信息", "number", "required", ["体重", "体重(kg)", "患者体重(kg)"], { unit: "kg", normalRange: { min: 30, max: 200, unit: "kg" } }),
    field("bsa", "体表面积", "患者基本信息", "number", "recommended", ["体表面积(m²)", "BSA"], { unit: "m²", dependencies: ["height", "weight"] }),

    field("diseaseType", "疾病类型", "疾病诊断", "enum", "required", ["诊断类型", "血液肿瘤类型"], {
      options: ["AML", "ALL", "CML", "CLL", "NHL", "HL", "MM", "MDS", "急性髓系白血病", "急性淋巴细胞白血病", "慢性髓系白血病", "慢性淋巴细胞白血病", "非霍奇金淋巴瘤", "霍奇金淋巴瘤", "多发性骨髓瘤", "骨髓增生异常综合征"]
    }),
    field("pathologySubtype", "病理亚型/分型", "疾病诊断", "text", "recommended", ["病理分型", "亚型", "分型"]),
    field("molecularFinding", "细胞遗传学/分子生物学异常", "疾病诊断", "multiChoice", "recommended", ["分子生物学异常", "细胞遗传学异常", "融合基因"]),

    field("ipiScore", "IPI/R-IPI评分", "疾病诊断", "score", "recommended", ["IPI评分", "R-IPI评分", "IPI", "R-IPI"], { diseaseScope: ["lymphoma"], applicableIf: applies.lymphoma }),
    field("annArborStage", "Ann Arbor分期", "疾病诊断", "score", "recommended", ["Ann Arbor", "AnnArbor"], { diseaseScope: ["lymphoma"], applicableIf: applies.lymphoma }),
    field("petCt", "PET-CT", "疾病诊断", "text", "recommended", ["PETCT", "PET CT"], { diseaseScope: ["lymphoma"], applicableIf: applies.lymphoma }),
    field("suvmax", "SUVmax", "疾病诊断", "number", "recommended", ["SUV最大值", "SUV max"], { diseaseScope: ["lymphoma"], applicableIf: applies.lymphoma }),
    field("bSymptoms", "B症状", "疾病诊断", "multiChoice", "recommended", ["B症状", "发热盗汗体重下降"], { diseaseScope: ["lymphoma"], applicableIf: applies.lymphoma }),
    field("lymphNodeRegion", "淋巴结区域", "疾病诊断", "text", "recommended", ["受累淋巴结区域", "淋巴结区域"], { diseaseScope: ["lymphoma"], applicableIf: applies.lymphoma }),

    field("issStage", "ISS分期", "疾病诊断", "score", "recommended", ["ISS", "骨髓瘤ISS分期"], { diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),
    field("rIssStage", "R-ISS分期", "疾病诊断", "score", "recommended", ["R-ISS", "修订ISS"], { diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),
    field("mProtein", "M蛋白", "疾病诊断", "lab", "recommended", ["M蛋白水平", "M蛋白定量"], { diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),
    field("beta2Microglobulin", "β2微球蛋白", "疾病诊断", "lab", "recommended", ["β2-MG", "B2M"], { diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),
    field("freeLightChain", "游离轻链", "疾病诊断", "lab", "recommended", ["FLC", "轻链", "游离轻链比值"], { diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),
    field("boneMarrowPlasmaCell", "骨髓浆细胞", "疾病诊断", "percentage", "recommended", ["浆细胞比例", "骨髓浆细胞比例"], { diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),
    field("crabFeature", "CRAB表现", "疾病诊断", "multiChoice", "recommended", ["CRAB", "高钙", "肾损害", "贫血", "骨病"], { diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),

    field("blastPercentage", "原始细胞比例", "疾病诊断", "percentage", "recommended", ["原始细胞", "骨髓原始细胞比例"], { diseaseScope: ["leukemia"], applicableIf: applies.leukemia }),
    field("boneMarrowClassification", "骨髓分类", "疾病诊断", "text", "recommended", ["骨髓分类", "骨髓形态学"], { diseaseScope: ["leukemia"], applicableIf: applies.leukemia }),
    field("bcrAbl", "BCR-ABL1融合", "疾病诊断", "text", "recommended", ["BCR-ABL", "BCR-ABL1", "融合基因BCR-ABL1"], { diseaseScope: ["leukemia"], applicableIf: applies.leukemia }),
    field("flt3", "FLT3", "疾病诊断", "text", "recommended", ["FLT3突变"], { diseaseScope: ["leukemia"], applicableIf: applies.leukemia }),
    field("npm1", "NPM1", "疾病诊断", "text", "recommended", ["NPM1突变"], { diseaseScope: ["leukemia"], applicableIf: applies.leukemia }),

    field("baselineDate", "治疗前评估日期", "治疗前评估", "timelineDate", "recommended", ["评估日期", "治疗前评估评估日期", "治疗前评估日期"]),
    field("ecog", "ECOG评分", "治疗前评估", "score", "recommended", ["ECOG", "体能状态"], { options: ["0", "1", "2", "3", "4"], normalRange: { min: 0, max: 4, unit: "分" } }),
    field("hb", "Hb", "治疗前评估", "lab", "recommended", ["血红蛋白", "HGB"], { normalRange: { min: 30, max: 220, unit: "g/L" } }),
    field("wbc", "WBC", "治疗前评估", "lab", "recommended", ["白细胞"], { normalRange: { min: 0, max: 300, unit: "×10^9/L" } }),
    field("anc", "ANC", "治疗前评估", "lab", "recommended", ["中性粒细胞绝对值"], { normalRange: { min: 0, max: 100, unit: "×10^9/L" } }),
    field("plt", "PLT", "治疗前评估", "lab", "recommended", ["血小板"], { normalRange: { min: 0, max: 1500, unit: "×10^9/L" } }),
    field("alt", "ALT", "治疗前评估", "lab", "optional", ["丙氨酸氨基转移酶"], { normalRange: { min: 0, max: 1000, unit: "U/L" } }),
    field("ast", "AST", "治疗前评估", "lab", "optional", ["天门冬氨酸氨基转移酶"], { normalRange: { min: 0, max: 1000, unit: "U/L" } }),
    field("creatinine", "Cr", "治疗前评估", "lab", "optional", ["肌酐", "Scr"], { normalRange: { min: 10, max: 1500, unit: "μmol/L" } }),
    field("egfr", "eGFR", "治疗前评估", "lab", "optional", ["肾小球滤过率"], { normalRange: { min: 0, max: 200, unit: "mL/min/1.73m²" } }),

    field("treatmentType", "治疗类型", "治疗方案", "enum", "required", ["治疗方式", "治疗方案类型"], { options: ["化疗", "靶向", "免疫", "CAR-T", "移植", "造血干细胞移植", "放疗", "支持治疗"] }),
    field("chemotherapyRegimen", "化疗方案", "治疗方案", "drugDose", "optional", ["化疗", "化疗药物", "化疗用药"], { validator: "drugDose" }),
    field("targetedTherapy", "靶向治疗", "治疗方案", "drugDose", "optional", ["靶向药物"], { validator: "drugDose" }),
    field("immunotherapy", "免疫治疗", "治疗方案", "drugDose", "optional", ["免疫治疗药物"], { validator: "drugDose" }),
    field("supportiveCare", "支持治疗", "治疗方案", "drugDose", "optional", ["支持用药", "辅助治疗"], { validator: "drugDose" }),
    field("combinedMedication", "联合用药", "治疗方案", "drugDose", "recommended", ["是否联合用药", "联合治疗", "联合方案"], { validator: "drugDose" }),
    field("maintenanceTherapy", "维持治疗", "治疗方案", "drugDose", "optional", ["维持用药", "维持方案"], { validator: "drugDose" }),
    field("cartTherapy", "CAR-T", "治疗方案", "drugDose", "optional", ["CAR-T治疗", "CAR T"], { validator: "drugDose" }),
    field("transplantType", "移植类型", "治疗方案", "enum", "recommended", ["造血干细胞移植类型"], { options: ["自体移植", "异体移植"], applicableIf: applies.transplant }),
    field("conditioningRegimen", "移植预处理", "治疗方案", "drugDose", "optional", ["预处理", "预处理方案"], { validator: "drugDose", applicableIf: applies.transplant }),
    field("infectionTreatment", "感染治疗", "治疗方案", "drugDose", "optional", ["抗感染治疗", "感染用药"], { validator: "drugDose" }),
    field("treatmentStartDate", "治疗开始日期", "治疗方案", "timelineDate", "required", ["治疗开始时间", "开始治疗日期"]),

    field("responseDate", "疗效评估日期", "疗效评价", "timelineDate", "required", ["疗效评价日期", "疗效评价评估日期"]),
    field("leukemiaResponse", "白血病疗效", "疗效评价", "enum", "recommended", ["白血病疗效评价"], { options: ["CR", "CRi", "PR", "SD", "复发", "进展", "复发/进展"], diseaseScope: ["leukemia"], applicableIf: applies.leukemia }),
    field("lymphomaResponse", "淋巴瘤疗效", "疗效评价", "enum", "recommended", ["淋巴瘤疗效评价"], { options: ["CR", "PR", "SD", "PD"], diseaseScope: ["lymphoma"], applicableIf: applies.lymphoma }),
    field("myelomaResponse", "骨髓瘤疗效", "疗效评价", "enum", "recommended", ["骨髓瘤疗效评价"], { options: ["sCR", "CR", "VGPR", "PR"], diseaseScope: ["myeloma"], applicableIf: applies.myeloma }),
    field("mrdStatus", "MRD状态", "疗效评价", "enum", "recommended", ["MRD"], { diseaseScope: ["myeloma", "leukemia"], applicableIf: ({ answers }) => applies.myeloma({ answers }) || applies.leukemia({ answers }) }),

    field("crsRecord", "CRS记录", "不良反应监测", "text", "recommended", ["CRS", "细胞因子释放综合征"], { applicableIf: applies.cart }),
    field("icansRecord", "ICANS记录", "不良反应监测", "text", "recommended", ["ICANS", "神经毒性"], { applicableIf: applies.cart }),
    field("gvhdRecord", "GVHD记录", "不良反应监测", "text", "recommended", ["GVHD", "移植物抗宿主病"], { applicableIf: applies.transplant }),
    field("stopDueToAe", "是否因副作用停药", "不良反应监测", "enum", "recommended", ["因副作用停药", "是否因不良反应停药"], { options: ["是", "否"] }),
    field("adverseEvent", "是否出现不良反应", "不良反应监测", "enum", "recommended", ["不良反应", "AE", "不良事件"], { options: ["无", "有", "否", "是"] }),
    field("adverseEventDate", "不良反应日期", "不良反应监测", "timelineDate", "recommended", ["AE日期", "不良事件日期"], { applicableIf: applies.adverseEvent }),

    field("followUpDate", "随访日期", "随访记录", "timelineDate", "recommended", ["随访时间"]),
    field("survivalStatus", "生存状态", "随访记录", "enum", "optional", ["患者生存状态"], { options: ["存活", "死亡"] }),
    field("deathDate", "死亡日期", "随访记录", "timelineDate", "required", ["死亡时间"], { applicableIf: applies.death }),
    field("relapseStatus", "复发情况", "随访记录", "enum", "recommended", ["是否复发", "复发状态"]),
    field("relapseDate", "复发日期", "随访记录", "timelineDate", "required", ["复发时间"], { applicableIf: applies.relapse })
  ]
};

function field(fieldId, fieldName, module, fieldType, requiredLevel, aliases = [], extra = {}) {
  return {
    key: fieldId,
    label: fieldName,
    type: fieldType,
    required: requiredLevel === "required",
    applicableIf: extra.applicableIf || extra.applicableWhen || null,
    diseaseScope: extra.diseaseScope || [],
    validator: extra.validator || "",
    dependencies: extra.dependencies || [],
    severity: extra.severity || (requiredLevel === "required" ? "medium" : "low"),
    explanation: extra.explanation || extra.description || "",
    fieldId,
    fieldName,
    module,
    aliases,
    fieldType,
    requiredLevel,
    requiredWhen: extra.requiredWhen || null,
    options: extra.options || [],
    unit: extra.unit || "",
    normalRange: extra.normalRange || null,
    applicableWhen: extra.applicableIf || extra.applicableWhen || null,
    description: extra.description || ""
  };
}
