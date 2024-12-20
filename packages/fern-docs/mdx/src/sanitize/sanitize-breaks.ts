export function sanitizeBreaks(content: string): string {
  return content.replaceAll(/<br\s*\/?>/g, "<br />").replaceAll("</br>", "");
}
