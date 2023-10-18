import { compile } from "html-to-text";
import { marked } from "marked";

const convertHtmlToText = compile({ wordwrap: 130 });

export function convertMarkdownToText(md: string) {
    const htmlStr = marked(md, { mangle: false, headerIds: false });
    return convertHtmlToText(htmlStr);
}

const MARKDOWN_PATTERNS = {
    boldText: /\*\*(.*?)\*\*/g,
    italicText1: /\*(.*?)\*/g,
    italicText2: /_(.*?)_/g,
    inlineCode: /`([^`]+)`/g,
    image: /!\[.*?\]\(.*?\)/g,
    link: /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/,
    heading: /^.*\n#{1,6}\s.*$/m,
    unorderedList: /^[*-]\s+/gm,
    orderedList: /^\d+\.\s+/gm,
    html: /<[^>]+>/,
};

export function mayContainMarkdown(str: string) {
    for (const pattern of Object.values(MARKDOWN_PATTERNS)) {
        if (pattern.test(str)) {
            return true;
        }
    }
    return false;
}
