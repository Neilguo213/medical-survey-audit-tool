export function toNumber(value) {
  const matched = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return matched ? Number(matched[0]) : NaN;
}

export function hasNumber(value) {
  return !Number.isNaN(toNumber(value));
}

export function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
