import { parseNumberWithUnit } from "../validators/valueValidators.js";

export function toNumber(value) {
  const parsed = parseNumberWithUnit(value);
  return parsed ? parsed.value : NaN;
}

export function hasNumber(value) {
  return !Number.isNaN(toNumber(value));
}

export function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
