import { memoize } from "es-toolkit/function";
import type { Root } from "hast";
import { h } from "hastscript";
import { useCallback, useEffect, useState } from "react";
import {
    bundledLanguages,
    getSingletonHighlighter,
    type BundledLanguage,
    type BundledTheme,
    type Highlighter,
    type SpecialLanguage,
} from "shiki";
import { additionalLanguages } from "./syntaxes";

let highlighter: Highlighter;

const DEFAULT = Symbol("DEFAULT");

const THEMES: Record<"light" | "dark", Record<string | typeof DEFAULT, BundledTheme>> = {
    light: {
        [DEFAULT]: "min-light",
        diff: "github-light", // `min-light` does not work well for diff
    },
    dark: {
        [DEFAULT]: "material-theme-darker",
    },
};

// only call this once per language
export const getHighlighterInstance: (language: string) => Promise<Highlighter> = memoize(
    async (language: string): Promise<Highlighter> => {
        const lang = parseLang(language);

        if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.debug("Loading language:", lang);
        }

        if (highlighter == null) {
            highlighter = await getSingletonHighlighter();
        }

        // load the themes used by the current language
        await highlighter.loadTheme(
            THEMES.light[lang] ?? THEMES.light[DEFAULT],
            THEMES.dark[lang] ?? THEMES.dark[DEFAULT],
        );

        if (!highlighter.getLoadedLanguages().includes(lang)) {
            try {
                await highlighter.loadLanguage(
                    additionalLanguages[lang] ?? (lang as BundledLanguage | SpecialLanguage),
                );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(`Failed to load language: ${lang}`, e);
            }
        }

        return highlighter;
    },
);

function hasLanguage(lang: string): boolean {
    return highlighter?.getLoadedLanguages().includes(parseLang(lang)) ?? false;
}

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
            light: THEMES.light[lang] ?? THEMES.light[DEFAULT],
            dark: THEMES.dark[lang] ?? THEMES.dark[DEFAULT],
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

export function parseLang(lang: string): string {
    lang = lang.trim();

    if (lang == null) {
        return "txt";
    }
    lang = lang.toLowerCase();
    if (Object.keys(bundledLanguages).includes(lang as BundledLanguage)) {
        return lang as BundledLanguage;
    }
    if (lang === "golang") {
        return "go";
    }
    if (lang === "curl") {
        return "bash";
    }
    if (Object.keys(additionalLanguages).includes(lang)) {
        return lang as SpecialLanguage;
    }
    return "txt";
}

type HighlightCallback = (code: string, language: string, cb: (tokens: HighlightedTokens) => void) => void;

/**
 * useHighlightTokens is a hook that wraps around highlightTokens to safely handle async highlighting.
 * Provided a code and language, it will first check if the language has already been loaded. If it hasn't,
 * it will call the cb() with unhighlighted tokens, and then asynchronously load the language and call the cb() again.
 *
 * the cb() function should be used to set the state of the component that will render the highlighted code. i.e.
 *
 * ```tsx
 * const { code, lang } = props;
 * const highlightTokens = useHighlightTokens();
 * const [tokens, setTokens] = useState<HighlightedTokens>(() => createRawTokens(code, lang));
 * useEffect(() => {
 *      highlightTokens(code, lang, setTokens);
 * }, [code, lang, setTokens]);
 *
 * // render the tokens
 * ```
 */
export function useHighlightTokens(): HighlightCallback {
    return useCallback<HighlightCallback>((code, language, cb) => {
        if (!hasLanguage(language)) {
            cb(createRawTokens(code, language));
        }
        void (async () => {
            const highlighter = await getHighlighterInstance(language);
            cb(highlightTokens(highlighter, code, language));
        })();
    }, []);
}

export function useHighlighter(lang: string): Highlighter | undefined {
    const [, setNonce] = useState(0);
    useEffect(() => {
        if (!hasLanguage(lang)) {
            void (async () => {
                await getHighlighterInstance(lang);
                setNonce((n) => n + 1);
            })();
        }
    }, [lang]);
    return hasLanguage(lang) ? highlighter : undefined;
}

export function createRawTokens(code: string, lang: string): HighlightedTokens {
    code = trimCode(code);

    return {
        code,
        lang,
        hast: {
            type: "root",
            children: [
                h("pre", [
                    h(
                        "code",
                        code
                            .split("\n")
                            .flatMap((line, idx) =>
                                idx === 0
                                    ? [h("span", { class: "line" }, line)]
                                    : ["\n", h("span", { class: "line" }, line)],
                            ),
                    ),
                ]),
            ],
        },
    };
}
