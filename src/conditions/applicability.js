import { diseaseInScope, isDiseaseGroup } from "../disease-maps/hematologyDiseaseMap.js";

export function isFieldApplicable(field, context) {
  if (!field) return false;
  if (field.diseaseScope?.length) {
    const disease = context.answers.diseaseType || "";
    if (!diseaseInScope(disease, field.diseaseScope)) return false;
  }
  const condition = field.applicableIf || field.applicableWhen;
  if (typeof condition !== "function") return true;
  try {
    return Boolean(condition(context));
  } catch {
    return false;
  }
}

export const applies = {
  her2Positive: ({ answers }) => /HER2\+|HER2阳性/i.test(answers.molecularSubtype || answers.her2Status || ""),
  hrPositive: ({ answers }) => /HR\+|ER\+|PR\+|激素受体阳性/i.test(answers.molecularSubtype || answers.hrStatus || ""),
  death: ({ answers }) => /死亡|是/.test(answers.survivalStatus || answers.deathStatus || ""),
  relapse: ({ answers }) => /复发|是|有/.test(answers.relapseStatus || ""),
  cart: ({ answers }) => /CAR-?T/i.test(`${answers.treatmentType || ""}${answers.cartTherapy || ""}`),
  transplant: ({ answers }) => /移植/.test(`${answers.treatmentType || ""}${answers.transplantType || ""}`),
  adverseEvent: ({ answers }) => /是|有/.test(`${answers.stopDueToAe || ""}${answers.adverseEvent || ""}`),
  lymphoma: ({ answers }) => isDiseaseGroup(answers.diseaseType, "lymphoma"),
  myeloma: ({ answers }) => isDiseaseGroup(answers.diseaseType, "myeloma"),
  leukemia: ({ answers }) => isDiseaseGroup(answers.diseaseType, "leukemia"),
  cml: ({ answers }) => isDiseaseGroup(answers.diseaseType, "cml"),
  stageIV: ({ answers }) => /IV|Ⅳ|M1/.test(`${answers.clinicalStage || ""}${answers.tnmStage || ""}`)
};
