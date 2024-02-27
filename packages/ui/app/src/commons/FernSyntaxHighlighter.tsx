import type { Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { h } from "hastscript";
import { forwardRef, useEffect, useMemo, useState } from "react";
// @ts-expect-error: the automatic react runtime is untyped.
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { getHighlighterInstance, highlight } from "./fernShiki";
import "./FernSyntaxHighlighter.css";
import { FernSyntaxHighlighterContent } from "./FernSyntaxHighlighterContent";

// [number, number] is a range of lines to highlight
type HighlightLine = number | [number, number];

interface FernSyntaxHighlighterProps {
    className?: string;
    style?: React.CSSProperties;
    code: string;
    language: string;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
    viewportRef?: React.RefObject<HTMLDivElement>;
}

const cachedHighlights = new Map<string, Root>();

function createRawHast(code: string): Root {
    return {
        type: "root",
        children: [
            h("pre", [
                h(
                    "code",
                    code.split("\n").map((line) => h("span", { class: "line" }, line)),
                ),
            ]),
        ],
    };
}

export const FernSyntaxHighlighter = forwardRef<HTMLPreElement, FernSyntaxHighlighterProps>(
    function FernSyntaxHighlighter({ code, language, ...props }, ref) {
        const [, setNonce] = useState<number>(0);
        const result = cachedHighlights.get(code);
        useEffect(() => {
            if (result != null) {
                return;
            }
            void (async () => {
                const highlighter = await getHighlighterInstance();
                const newResult = highlight(highlighter, code, language);
                cachedHighlights.set(code, newResult);
                setNonce((nonce) => nonce + 1);
            })();
        }, [code, language, result]);

        return (
            <FernSyntaxHighlighterHast ref={ref} hast={result ?? createRawHast(code)} language={language} {...props} />
        );
    },
);

interface FernSyntaxHighlighterHastProps {
    className?: string;
    style?: React.CSSProperties;
    hast: Root;
    language: string;
    fontSize?: "sm" | "base" | "lg";
    highlightLines?: HighlightLine[];
    highlightStyle?: "highlight" | "focus";
    viewportRef?: React.RefObject<HTMLDivElement>;
}

export const FernSyntaxHighlighterHast = forwardRef<HTMLPreElement, FernSyntaxHighlighterHastProps>(
    function FernSyntaxHighlighter({ hast, language, ...props }, ref) {
        const result = useMemo(
            () =>
                toJsxRuntime(hast, {
                    Fragment,
                    jsx,
                    jsxs,
                }),
            [hast],
        );

        return (
            <FernSyntaxHighlighterContent
                ref={ref}
                gutterCli={language === "bash" || language === "shell"}
                plaintext={language === "plaintext" || language === "text" || language === "txt"}
                {...props}
            >
                {result}
            </FernSyntaxHighlighterContent>
        );
    },
);

// remove leading and trailing newlines
export function trimCode(code: string): string {
    return code.replace(/^\n+|\n+$/g, "");
}
