import { applies } from "../conditions/applicability.js";

export const breastCancerTemplate = {
  id: "breast",
  name: "乳腺癌 CRF",
  sample: `1 首次就诊时间: 2026-02-21
3 年龄: 46
4 性别: 女
5 身高: 153
6 体重: 51
7 BMI: 33.3
15 病理类型: 浸润性导管癌
16 分子分型: HR+/HER2+
17 TNM分期: T1N0M0
18 临床分期: I期
24 淋巴结状态: 阳性 数量1
30 治疗开始时间: 2026-03-01
32 评估日期: 2026-07-01
33 RECIST: PR
治疗前肿瘤最大径: 2.1
治疗后肿瘤最大径: 3.4
39 是否因副作用停药: 是
41 是否出现不良反应: 无`,
  fields: [
    field("firstVisitDate", "首次就诊时间", "患者基本信息", "date", "required", ["首次就诊日期", "首诊时间"]),
    field("diagnosisDate", "确诊日期", "疾病诊断", "timelineDate", "recommended", ["病理确诊日期", "诊断日期"]),
    field("age", "年龄", "患者基本信息", "number", "required", ["患者年龄"], { normalRange: { min: 0, max: 120, unit: "岁" } }),
    field("sex", "性别", "患者基本信息", "singleChoice", "required", ["患者性别"], { options: ["男", "女"] }),
    field("height", "身高", "患者基本信息", "number", "required", ["患者身高", "身高(cm)", "患者身高(cm)"], { unit: "cm", normalRange: { min: 100, max: 230, unit: "cm" } }),
    field("weight", "体重", "患者基本信息", "number", "required", ["患者体重", "体重(kg)", "患者体重(kg)"], { unit: "kg", normalRange: { min: 30, max: 200, unit: "kg" } }),
    field("bmi", "BMI", "患者基本信息", "number", "recommended", ["体质指数", "BMI(kg/m²)"], { unit: "kg/m²", dependencies: ["height", "weight"] }),
    field("pathologyType", "病理类型", "疾病诊断", "singleChoice", "recommended", ["组织学类型"]),
    field("molecularSubtype", "分子分型", "疾病诊断", "singleChoice", "required", ["乳腺癌分子分型"], { options: ["HR+/HER2-", "HR+/HER2+", "HR-/HER2+", "三阴性"] }),
    field("tnmStage", "TNM分期", "疾病诊断", "text", "recommended", ["TNM"]),
    field("clinicalStage", "临床分期", "疾病诊断", "singleChoice", "required", ["分期"], { options: ["I期", "II期", "III期", "IV期", "Ⅰ期", "Ⅱ期", "Ⅲ期", "Ⅳ期"] }),
    field("metastasisInfo", "转移信息", "疾病诊断", "text", "recommended", ["远处转移", "骨转移", "肝转移", "肺转移", "脑转移", "转移部位"], {
      applicableWhen: ({ answers }) => /IV|Ⅳ/.test(answers.clinicalStage || "")
    }),
    field("nodeStatus", "淋巴结状态", "疾病诊断", "singleChoice", "recommended", ["淋巴结", "淋巴结转移状态"]),
    field("treatmentStartDate", "治疗开始时间", "治疗方案", "date", "required", ["治疗开始日期", "开始治疗时间"]),
    field("chemotherapyRegimen", "化疗方案", "治疗方案", "drugDose", "optional", ["化疗", "化疗药物", "化疗用药"], { validator: "drugDose" }),
    field("targetedTherapy", "HER2靶向治疗", "治疗方案", "drugDose", "recommended", ["抗HER2治疗", "靶向治疗", "曲妥珠单抗", "帕妥珠单抗", "T-DXd"], {
      applicableIf: applies.her2Positive,
      validator: "drugDose"
    }),
    field("endocrineTherapy", "内分泌治疗", "治疗方案", "drugDose", "recommended", ["激素治疗", "内分泌方案", "内分泌药物"], {
      applicableIf: applies.hrPositive,
      validator: "drugDose"
    }),
    field("immunotherapy", "免疫治疗", "治疗方案", "drugDose", "optional", ["免疫治疗药物", "PD-1", "PD-L1"], { validator: "drugDose" }),
    field("supportiveCare", "支持治疗", "治疗方案", "drugDose", "optional", ["支持用药", "辅助治疗"], { validator: "drugDose" }),
    field("maintenanceTherapy", "维持治疗", "治疗方案", "drugDose", "optional", ["维持用药", "维持方案"], { validator: "drugDose" }),
    field("responseDate", "疗效评估日期", "疗效评价", "date", "required", ["评估日期", "疗效评价日期", "疗效评价评估日期"]),
    field("recist", "RECIST", "疗效评价", "singleChoice", "required", ["RECIST评价"], { options: ["CR", "PR", "SD", "PD", "完全缓解", "部分缓解", "疾病稳定", "疾病进展"] }),
    field("tumorSizeBefore", "治疗前肿瘤最大径", "疗效评价", "number", "recommended", ["基线肿瘤最大径", "治疗前最大径"], { unit: "cm" }),
    field("tumorSizeAfter", "治疗后肿瘤最大径", "疗效评价", "number", "recommended", ["复查肿瘤最大径", "治疗后最大径"], { unit: "cm" }),
    field("stopDueToAe", "是否因副作用停药", "不良反应监测", "singleChoice", "recommended", ["因副作用停药", "是否因不良反应停药"], { options: ["是", "否"] }),
    field("adverseEvent", "是否出现不良反应", "不良反应监测", "singleChoice", "recommended", ["不良反应", "AE", "不良事件"], { options: ["无", "有", "否", "是"] }),
    field("adverseEventDate", "不良反应日期", "不良反应监测", "timelineDate", "recommended", ["AE日期", "不良事件日期"], {
      applicableIf: applies.adverseEvent
    }),
    field("aeManagement", "不良反应处理措施", "不良反应监测", "text", "recommended", ["AE处理", "处理措施", "不良反应处理"], {
      applicableIf: applies.adverseEvent
    }),
    field("followUpDate", "随访日期", "随访记录", "timelineDate", "recommended", ["随访时间"]),
    field("survivalStatus", "生存状态", "随访记录", "singleChoice", "optional", ["是否死亡", "死亡"], { options: ["存活", "死亡", "是", "否"] }),
    field("deathDate", "死亡日期", "随访记录", "timelineDate", "required", ["死亡时间"], { applicableIf: applies.death }),
    field("relapseStatus", "复发情况", "随访记录", "singleChoice", "optional", ["是否复发"], { options: ["无复发", "复发", "是", "否"] }),
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
    dependencies: extra.dependencies || [],
    description: extra.description || ""
  };
}
