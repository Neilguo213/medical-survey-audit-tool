import { normalizeQuestion } from "../utils/textUtils.js";

export function matchField(rawQuestion, template, claimedFieldIds = new Set()) {
  const question = normalizeQuestion(rawQuestion);
  let best = null;

  for (const field of template.fields) {
    if (claimedFieldIds.has(field.fieldId)) continue;
    const tokens = [field.fieldName, ...(field.aliases || [])].map(normalizeQuestion).filter(Boolean);
    const scored = scoreTokens(question, tokens);
    if (!best || scored.confidence > best.confidence) {
      best = { field, ...scored };
    }
  }

  if (!best || best.confidence < 0.45) return null;
  return {
    field: best.field,
    confidence: best.confidence,
    matchedBy: best.matchedBy
  };
}

function scoreTokens(question, tokens) {
  let result = { confidence: 0, matchedBy: "none" };
  for (const token of tokens) {
    if (!token) continue;
    if (question === token) {
      result = maxScore(result, 1, "exact");
    } else if (question.includes(token) || token.includes(question)) {
      const confidence = Math.min(0.92, Math.max(0.72, Math.min(question.length, token.length) / Math.max(question.length, token.length)));
      result = maxScore(result, confidence, "alias");
    } else {
      const fuzzy = diceCoefficient(question, token);
      if (fuzzy >= 0.45) result = maxScore(result, fuzzy, "fuzzy");
    }
  }
  return result;
}

function maxScore(current, confidence, matchedBy) {
  return confidence > current.confidence ? { confidence, matchedBy } : current;
}

function diceCoefficient(a, b) {
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const pairs = new Map();
  for (let i = 0; i < a.length - 1; i += 1) {
    const pair = a.slice(i, i + 2);
    pairs.set(pair, (pairs.get(pair) || 0) + 1);
  }
  let intersection = 0;
  for (let i = 0; i < b.length - 1; i += 1) {
    const pair = b.slice(i, i + 2);
    const count = pairs.get(pair) || 0;
    if (count > 0) {
      pairs.set(pair, count - 1);
      intersection += 1;
    }
  }
  return (2 * intersection) / (a.length + b.length - 2);
}
