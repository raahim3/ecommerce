export function replaceStoreNameInContent(value, storeName, escapeHtml = false) {
  const replacement = storeName || "Store";
  const safeReplacement = escapeHtml
    ? replacement.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character])
    : replacement;

  if (typeof value === "string") {
    return value.replace(/\b(?:Atelier|ATELIER)\b/g, safeReplacement);
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceStoreNameInContent(item, storeName, escapeHtml));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceStoreNameInContent(item, storeName, escapeHtml)]),
    );
  }
  return value;
}
