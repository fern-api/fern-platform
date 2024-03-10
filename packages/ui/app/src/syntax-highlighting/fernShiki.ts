import { Root } from "hast";
import { BundledLanguage, BundledTheme, getHighlighter, Highlighter, SpecialLanguage } from "shiki/index.mjs";

let highlighter: Highlighter;
export async function getHighlighterInstance(language: string): Promise<Highlighter> {
    const lang = parseLang(language);
    if (highlighter == null) {
        highlighter = await getHighlighter({
            langs: [lang],
            themes: [LIGHT_THEME, DARK_THEME],
        });
    }

    if (!highlighter.getLoadedLanguages().includes(lang)) {
        await highlighter.loadLanguage(lang);
    }

    return highlighter;
}

// export function highlight(
//     highlighter: Highlighter,
//     code: string,
//     rawLang: string,
//     meta?: Record<string, unknown>,
// ): { hast: Root; language: string } {
//     const lang = parseLang(rawLang);
//     const root = highlighter.codeToHast(code, {
//         lang,
//         themes: {
//             light: LIGHT_THEME,
//             dark: DARK_THEME,
//         },
//         transformers: [transformerMetaHighlight()],
//         meta,
//     });
//     return { hast: root as Root, language: lang };
// }

export interface HighlightedTokens {
    code: string;
    lang: string;
    hast: Root;
}

export function highlightTokens(highlighter: Highlighter, code: string, rawLang: string): HighlightedTokens {
    code = trimCode(code);
    const lang = parseLang(rawLang);
    const hast = highlighter.codeToHast(code, {
        lang,
        themes: {
            light: LIGHT_THEME,
            dark: DARK_THEME,
        },
    }) as Root;
    return { code, lang, hast };
}

// remove leading and trailing newlines
export function trimCode(code: string): string {
    if (code == null) {
        return "";
    }
    return code.replace(/^\n+|\n+$/g, "");
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
    "sql",
];

export function parseLang(lang: string): BundledLanguage | SpecialLanguage {
    if (lang == null) {
        return "txt";
    }
    lang = lang.toLowerCase();
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
