export function toDate(value) {
  const matched = String(value ?? "").match(/\d{4}[-/年.]\d{1,2}[-/月.]\d{1,2}/);
  if (!matched) return null;
  const normalized = matched[0].replace(/[年月/.]/g, "-").replace(/日/g, "");
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidDate(value) {
  return Boolean(toDate(value));
}
