export const hematologyDiseaseGroups = {
  lymphoma: ["NHL", "HL", "淋巴瘤", "非霍奇金", "霍奇金"],
  myeloma: ["MM", "多发性骨髓瘤", "骨髓瘤"],
  leukemia: ["AML", "ALL", "CML", "CLL", "白血病"],
  cml: ["CML", "慢性髓系白血病"]
};

export function diseaseInScope(value, scope = []) {
  if (!scope.length) return true;
  return scope.some((name) => isDiseaseGroup(value, name) || String(value || "").includes(name));
}

export function isDiseaseGroup(value, group) {
  const terms = hematologyDiseaseGroups[group] || [group];
  const text = String(value || "");
  return terms.some((term) => new RegExp(escapeRegExp(term), "i").test(text));
}

export function diseaseLabel(group) {
  return {
    lymphoma: "淋巴瘤",
    myeloma: "MM/多发性骨髓瘤",
    leukemia: "白血病",
    cml: "CML"
  }[group] || group;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
