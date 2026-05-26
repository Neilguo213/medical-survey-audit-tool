export function normalizeQuestion(value) {
  return String(value ?? "")
    .replace(/^\d+\s*[、.．]?\s*/, "")
    .replace(/[（(][^）)]*(cm|kg|m²|m2|分|%)\s*[）)]/gi, "")
    .replace(/[\s\-—_：:，,。；;（）()\[\]【】]/g, "")
    .replace(/请填写|请选择|患者|您的|您所在的/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeValue(value) {
  return String(value ?? "")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/[□○]/g, "")
    .replace(/[☑✓✔]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function includesAny(value, terms) {
  const text = String(value ?? "").toLowerCase();
  return terms.some((term) => text.includes(String(term).toLowerCase()));
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
