export const hematologyTemplate = {
  id: "blood",
  name: "血液肿瘤 CRF",
  sample: `1 首次就诊时间: 2026-03-24
2 患者姓名首字母缩写: luhg
3 年龄: 57
4 性别: 男
5 患者身高(cm): 173
6 患者体重(kg): 65
7 体表面积(m²): 2
15 疾病类型: 多发性骨髓瘤（MM）
16 病理亚型/分型: 多发性骨髓瘤 ISS I期 R-ISS III期
19 IPI/R-IPI评分: 不适用
20 ISS分期: Ⅲ期
21 评估日期: 2026-03-24
22 ECOG评分: 0
36 治疗类型: 造血干细胞移植
37 移植类型: 自体移植
39 治疗开始日期: 2025-10-24
41 疗效评估日期: 2026-03-24
44 骨髓瘤疗效: 严格意义的完全缓解（sCR）
45 MRD状态: 阴性（灵敏度）
50 是否因副作用停药: 是
53 是否出现不良反应: 无
54 随访日期: 2026-05-23`,
  fields: [
    field("firstVisitDate", "首次就诊时间", "患者基本信息", "date", "required", ["首次就诊日期", "首诊时间"]),
    field("patientInitials", "患者姓名首字母缩写", "患者基本信息", "text", "optional", ["姓名首字母", "首字母缩写"]),
    field("age", "年龄", "患者基本信息", "number", "required", ["患者年龄"], { normalRange: { min: 0, max: 120, unit: "岁" } }),
    field("sex", "性别", "患者基本信息", "singleChoice", "required", ["患者性别"], { options: ["男", "女"] }),
    field("height", "患者身高", "患者基本信息", "number", "required", ["身高", "身高(cm)", "患者身高(cm)"], { unit: "cm", normalRange: { min: 100, max: 230, unit: "cm" } }),
    field("weight", "患者体重", "患者基本信息", "number", "required", ["体重", "体重(kg)", "患者体重(kg)"], { unit: "kg", normalRange: { min: 30, max: 200, unit: "kg" } }),
    field("bsa", "体表面积", "患者基本信息", "number", "recommended", ["体表面积(m²)", "BSA"], { unit: "m²", dependencies: ["height", "weight"] }),
    field("diseaseType", "疾病类型", "疾病诊断", "singleChoice", "required", ["诊断类型", "血液肿瘤类型"], {
      options: ["AML", "ALL", "CML", "CLL", "NHL", "HL", "MM", "MDS", "急性髓系白血病", "急性淋巴细胞白血病", "慢性髓系白血病", "慢性淋巴细胞白血病", "非霍奇金淋巴瘤", "霍奇金淋巴瘤", "多发性骨髓瘤", "骨髓增生异常综合征"]
    }),
    field("pathologySubtype", "病理亚型/分型", "疾病诊断", "text", "recommended", ["病理分型", "亚型", "分型"]),
    field("molecularFinding", "细胞遗传学/分子生物学异常", "疾病诊断", "multiChoice", "recommended", ["分子生物学异常", "细胞遗传学异常", "融合基因"]),
    field("ipiScore", "IPI/R-IPI评分", "疾病诊断", "text", "recommended", ["IPI评分", "R-IPI评分"], {
      applicableWhen: ({ answers }) => isLymphoma(answers.diseaseType)
    }),
    field("issStage", "ISS分期", "疾病诊断", "singleChoice", "recommended", ["ISS", "骨髓瘤ISS分期"], {
      applicableWhen: ({ answers }) => isMyeloma(answers.diseaseType)
    }),
    field("bcrAbl", "BCR-ABL1融合", "疾病诊断", "text", "recommended", ["BCR-ABL", "BCR-ABL1", "融合基因BCR-ABL1"], {
      applicableWhen: ({ answers }) => isCml(answers.diseaseType)
    }),
    field("baselineDate", "治疗前评估日期", "治疗前评估", "date", "recommended", ["评估日期", "治疗前评估评估日期", "治疗前评估日期"]),
    field("ecog", "ECOG评分", "治疗前评估", "number", "recommended", ["ECOG", "体能状态"], { options: ["0", "1", "2", "3", "4"], normalRange: { min: 0, max: 4, unit: "分" } }),
    field("treatmentType", "治疗类型", "治疗方案", "singleChoice", "required", ["治疗方式", "治疗方案类型"], { options: ["化疗", "靶向", "免疫", "CAR-T", "移植", "造血干细胞移植", "放疗", "支持治疗"] }),
    field("transplantType", "移植类型", "治疗方案", "singleChoice", "recommended", ["造血干细胞移植类型"], {
      options: ["自体移植", "异体移植"],
      applicableWhen: ({ answers }) => /移植/.test(answers.treatmentType || "")
    }),
    field("conditioningRegimen", "预处理方案", "治疗方案", "text", "optional", ["预处理"]),
    field("treatmentStartDate", "治疗开始日期", "治疗方案", "date", "required", ["治疗开始时间", "开始治疗日期"]),
    field("responseDate", "疗效评估日期", "疗效评价", "date", "required", ["疗效评价日期", "疗效评价评估日期"]),
    field("leukemiaResponse", "白血病疗效", "疗效评价", "singleChoice", "recommended", ["白血病疗效评价"], {
      options: ["CR", "CRi", "PR", "SD", "复发", "进展", "复发/进展"],
      applicableWhen: ({ answers }) => isLeukemia(answers.diseaseType)
    }),
    field("lymphomaResponse", "淋巴瘤疗效", "疗效评价", "singleChoice", "recommended", ["淋巴瘤疗效评价"], {
      options: ["CR", "PR", "SD", "PD"],
      applicableWhen: ({ answers }) => isLymphoma(answers.diseaseType)
    }),
    field("myelomaResponse", "骨髓瘤疗效", "疗效评价", "singleChoice", "recommended", ["骨髓瘤疗效评价"], {
      options: ["sCR", "CR", "VGPR", "PR"],
      applicableWhen: ({ answers }) => isMyeloma(answers.diseaseType)
    }),
    field("mrdStatus", "MRD状态", "疗效评价", "singleChoice", "recommended", ["MRD"], {
      applicableWhen: ({ answers }) => isMyeloma(answers.diseaseType) || isLeukemia(answers.diseaseType)
    }),
    field("crsRecord", "CRS记录", "不良反应监测", "text", "recommended", ["CRS", "细胞因子释放综合征"], {
      applicableWhen: ({ answers }) => /CAR-?T/i.test(answers.treatmentType || "")
    }),
    field("icansRecord", "ICANS记录", "不良反应监测", "text", "recommended", ["ICANS", "神经毒性"], {
      applicableWhen: ({ answers }) => /CAR-?T/i.test(answers.treatmentType || "")
    }),
    field("gvhdRecord", "GVHD记录", "不良反应监测", "text", "recommended", ["GVHD", "移植物抗宿主病"], {
      applicableWhen: ({ answers }) => /移植/.test(answers.treatmentType || "")
    }),
    field("stopDueToAe", "是否因副作用停药", "不良反应监测", "singleChoice", "recommended", ["因副作用停药", "是否因不良反应停药"], { options: ["是", "否"] }),
    field("adverseEvent", "是否出现不良反应", "不良反应监测", "singleChoice", "recommended", ["不良反应", "AE", "不良事件"], { options: ["无", "有", "否", "是"] }),
    field("followUpDate", "随访日期", "随访记录", "date", "recommended", ["随访时间"]),
    field("survivalStatus", "生存状态", "随访记录", "singleChoice", "optional", ["患者生存状态"], { options: ["存活", "死亡"] }),
    field("relapseStatus", "复发情况", "随访记录", "singleChoice", "recommended", ["是否复发", "复发状态"])
  ]
};

function field(fieldId, fieldName, module, fieldType, requiredLevel, aliases = [], extra = {}) {
  return {
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
    applicableWhen: extra.applicableWhen || null,
    dependencies: extra.dependencies || [],
    description: extra.description || ""
  };
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
