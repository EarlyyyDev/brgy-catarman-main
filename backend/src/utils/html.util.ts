/**
 * Server-side plain-text excerpt generator, replacing the frontend
 * prototype's DOM-based `makeExcerpt` (which relied on a throwaway browser
 * element and can't run server-side). Strips tags with a regex rather than
 * pulling in a full HTML parser — adequate for excerpting rich-text-editor
 * output where we control the source formatting.
 */
export function stripHtmlToExcerpt(html: string, maxLength = 140): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}...`;
}
