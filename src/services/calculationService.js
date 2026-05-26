import { round } from "../utils/numberUtils.js";

export function calculateBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg) return NaN;
  return weightKg / ((heightCm / 100) ** 2);
}

export function calculateBsa(heightCm, weightKg) {
  if (!heightCm || !weightKg) return NaN;
  return Math.sqrt((heightCm * weightKg) / 3600);
}

export function formatBmi(value) {
  return round(value, 1).toFixed(1);
}

export function formatBsa(value) {
  return round(value, 2).toFixed(2);
}
