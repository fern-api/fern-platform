import { compile } from "html-to-text";
import { marked } from "marked";

const convertHtmlToText = compile({ wordwrap: 130 });

export function convertMarkdownToText(md?: string): string {
  if (md != null) {
    const htmlStr = marked(md, { mangle: false, headerIds: false });
    return convertHtmlToText(htmlStr);
  }

  return "";
}
