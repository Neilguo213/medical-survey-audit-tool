export const EMPTY_MARKERS = ["", "无", "未知", "/", "-", "NA", "N/A", "未填写", "未填", "不详"];

export function normalizeWidth(value) {
  return String(value ?? "").replace(/[！-～]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0)).replace(/　/g, " ");
}

export function isEmptyValue(value) {
  const text = normalizeWidth(value).trim();
  return EMPTY_MARKERS.some((marker) => text.toUpperCase() === marker.toUpperCase());
}

export function parseNumberWithUnit(value) {
  const text = normalizeWidth(value);
  const matched = text.match(/-?\d+(?:\.\d+)?\s*(mg\/m2|mg\/m²|mg|g|kg|cm|ml|iu|IU|U|分|%|×?10\^?9\/L|umol\/L|μmol\/L)?/);
  if (!matched) return null;
  return {
    value: Number(matched[0].match(/-?\d+(?:\.\d+)?/)?.[0]),
    unit: matched[1] || ""
  };
}

export function parseValidDate(value) {
  const text = normalizeWidth(value).trim();
  const matched = text.match(/\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}/);
  if (!matched) return null;
  const normalized = matched[0].replace(/[年月/.]/g, "-").replace(/日/g, "");
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return null;
  return date;
}

export function optionMatches(value, options = []) {
  const text = normalizeWidth(value);
  return options.some((option) => text.includes(option) || String(option).includes(text));
}
