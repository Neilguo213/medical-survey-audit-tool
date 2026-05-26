import {
  calculationCheck,
  formatCheck,
  parseWarningCheck,
  rangeCheck,
  requiredCheck,
  timelineCheck
} from "../rules/commonRules.js";
import {
  breastConditionalCheck,
  breastConsistencyCheck,
  breastDiseaseSpecificCheck
} from "../rules/breastCancerRules.js";
import {
  hematologyConditionalCheck,
  hematologyConsistencyCheck,
  hematologyDiseaseSpecificCheck
} from "../rules/hematologyRules.js";

const severityRank = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

export function auditCase({ template, parsed, strictness = "standard" }) {
  const fieldById = Object.fromEntries(template.fields.map((field) => [field.fieldId, field]));
  const fieldMap = Object.fromEntries(parsed.fields.map((field) => [field.fieldId, field]));
  const context = {
    template,
    parsed,
    answers: parsed.answers,
    strictness,
    fieldById,
    fieldMap
  };

  const issues = [
    ...parseWarningCheck(context),
    ...requiredCheck(context),
    ...rangeCheck(context),
    ...formatCheck(context),
    ...calculationCheck(context),
    ...timelineCheck(context),
    ...conditionalCheck(context),
    ...diseaseSpecificCheck(context),
    ...consistencyCheck(context)
  ].filter((issue) => issue.strictness.includes(strictness));

  const sortedIssues = issues.sort((a, b) => {
    const severity = severityRank[a.severity] - severityRank[b.severity];
    return severity || a.module.localeCompare(b.module, "zh-Hans-CN");
  });

  return {
    issues: sortedIssues,
    stats: buildStats(sortedIssues),
    groupedIssues: groupByModule(sortedIssues)
  };
}

function conditionalCheck(context) {
  if (context.template.id === "breast") return breastConditionalCheck(context);
  if (context.template.id === "blood") return hematologyConditionalCheck(context);
  return [];
}

function diseaseSpecificCheck(context) {
  if (context.template.id === "breast") return breastDiseaseSpecificCheck(context);
  if (context.template.id === "blood") return hematologyDiseaseSpecificCheck(context);
  return [];
}

function consistencyCheck(context) {
  if (context.template.id === "breast") return breastConsistencyCheck(context);
  if (context.template.id === "blood") return hematologyConsistencyCheck(context);
  return [];
}

function buildStats(issues) {
  return issues.reduce((stats, issue) => {
    stats[issue.severity] = (stats[issue.severity] || 0) + 1;
    return stats;
  }, { critical: 0, high: 0, medium: 0, low: 0, info: 0 });
}

function groupByModule(issues) {
  return issues.reduce((groups, issue) => {
    if (!groups[issue.module]) groups[issue.module] = [];
    groups[issue.module].push(issue);
    return groups;
  }, {});
}
