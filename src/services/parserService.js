import { matchField } from "./fieldMatcher.js";
import { extractQuestionAnswerItems } from "../parsers/textParser.js";
import { normalizeValue } from "../utils/textUtils.js";

export function parseCase(input, template) {
  const rawItems = extractQuestionAnswerItems(input);
  const claimedFieldIds = new Set();
  const fields = [];
  const answers = {};
  const unmatchedItems = [];

  for (const item of rawItems) {
    const match = matchField(item.rawQuestion, template, claimedFieldIds);
    if (!match) {
      unmatchedItems.push(item);
      continue;
    }
    const parsed = {
      fieldId: match.field.fieldId,
      fieldName: match.field.fieldName,
      module: match.field.module,
      rawQuestion: item.rawQuestion,
      rawAnswer: item.rawAnswer,
      normalizedValue: normalizeValue(item.rawAnswer),
      confidence: match.confidence,
      source: item.source,
      matchedBy: match.matchedBy
    };
    fields.push(parsed);
    answers[parsed.fieldId] = parsed.normalizedValue;
    claimedFieldIds.add(parsed.fieldId);
  }

  return { fields, answers, unmatchedItems, rawItems };
}

export { extractQuestionAnswerItems };
