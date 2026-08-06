export function normalizeText(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}