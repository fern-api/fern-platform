import { MarkdownText } from "@fern-api/fdr-sdk/docs";
import { compile } from "html-to-text";
import { marked } from "marked";

const convertHtmlToText = compile({ wordwrap: 130 });

export function convertMarkdownToText(md?: MarkdownText): string {
  if (md && typeof md === "string") {
    const htmlStr = marked(md, { mangle: false, headerIds: false });
    return convertHtmlToText(htmlStr);
  }

  return "";
}
