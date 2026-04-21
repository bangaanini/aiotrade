import DOMPurify from "isomorphic-dompurify";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasHtmlMarkup(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function normalizeArticleContent(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (hasHtmlMarkup(trimmedValue)) {
    return trimmedValue;
  }

  const paragraphs = trimmedValue
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) =>
      `<p>${paragraph
        .split(/\n/)
        .map((line) => escapeHtml(line.trim()))
        .filter(Boolean)
        .join("<br />")}</p>`,
    );

  return paragraphs.join("");
}

export function sanitizeArticleHtml(value: string) {
  return DOMPurify.sanitize(normalizeArticleContent(value), {
    ALLOWED_ATTR: [
      "alt",
      "checked",
      "class",
      "data-checked",
      "data-type",
      "disabled",
      "href",
      "rel",
      "src",
      "target",
      "title",
      "type",
    ],
    ALLOWED_TAGS: [
      "a",
      "blockquote",
      "br",
      "div",
      "em",
      "figcaption",
      "figure",
      "h2",
      "h3",
      "h4",
      "hr",
      "img",
      "input",
      "label",
      "li",
      "ol",
      "p",
      "span",
      "strong",
      "u",
      "ul",
    ],
  });
}

export function extractPlainTextFromArticleContent(value: string) {
  return sanitizeArticleHtml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h2|h3|h4|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
