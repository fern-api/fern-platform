import { transformerMetaHighlight } from "@shikijs/transformers";
import { Root } from "hast";
import { BundledLanguage, BundledTheme, getHighlighter, Highlighter, SpecialLanguage } from "shiki/index.mjs";

let highlighter: Highlighter;
export async function getHighlighterInstance(): Promise<Highlighter> {
    if (!highlighter) {
        highlighter = await getHighlighter({
            langs: LANGUAGES,
            themes: [LIGHT_THEME, DARK_THEME],
        });
    }

    return highlighter;
}

export function highlight(
    highlighter: Highlighter,
    code: string,
    rawLang: string,
    meta?: Record<string, unknown>,
): Root {
    const lang = parseLang(rawLang);
    const root = highlighter.codeToHast(code, {
        lang,
        themes: {
            light: LIGHT_THEME,
            dark: DARK_THEME,
        },
        transformers: [transformerMetaHighlight()],
        meta,
    });
    return root as Root;
}

export const LIGHT_THEME: BundledTheme = "min-light";
export const DARK_THEME: BundledTheme = "material-theme-darker";
export const LANGUAGES: Array<BundledLanguage | SpecialLanguage> = [
    "bash",
    "c#",
    "csharp",
    "css",
    "docker",
    "dockerfile",
    "go",
    "java",
    "javascript",
    "js",
    "json",
    "kotlin",
    "plaintext",
    "python",
    "ruby",
    "shell",
    "text",
    "ts",
    "typescript",
    "txt",
    "xml",
    "yaml",
    "yml",
];

function parseLang(lang: string): BundledLanguage | SpecialLanguage {
    if (LANGUAGES.includes(lang as BundledLanguage)) {
        return lang as BundledLanguage;
    }
    if (lang === "golang") {
        return "go";
    }
    if (lang === "curl") {
        return "bash";
    }
    return "txt";
}
