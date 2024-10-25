import { VFileMessage } from "vfile-message";
import { mdastFromMarkdown } from "../mdast-utils/mdast-from-markdown.js";
import { getStart, isPoint } from "../position.js";

interface ErrorContext {
    error: VFileMessage;
    handled: boolean;
    affectedLine: string | undefined;
}

// error rules are from
// - acorn: https://github.com/micromark/micromark-extension-mdx-expression/blob/main/packages/micromark-extension-mdx-expression/readme.md#errors
// - jsx:   https://github.com/micromark/micromark-extension-mdx-jsx?tab=readme-ov-file#errors
const RULE_IDS = {
    UNEXPECTED_EOF: "unexpected-eof",
    UNEXPECTED_CHARACTER: "unexpected-character",
    UNEXPECTED_LAZY: "unexpected-lazy",
    NON_SPREAD: "non-spread",
    SPREAD_EXTRA: "spread-extra",
    ACORN: "acorn",
} as const;

/**
 * If the markdown contains unescaped curly braces that are not part of a javascript expression, the acorn parser will fail.
 * This function attempts to sanitize the markdown by escaping the curly braces, but listening for VFileMessage errors.
 *
 * This is not really efficient because it can loop a lot and depends on try-catching errors, but it performs a bit of "magic" to improve quality of life.
 */
export function sanitizeMdxExpression(content: string): string {
    // these are errors encountered but sanitized
    const errors: ErrorContext[] = [];

    let loops = 0;
    while (loops++ < 100) {
        if (loops === 100) {
            // eslint-disable-next-line no-console
            console.error("Infinite Loop Detected: sanitizing acorn failed");
        }

        try {
            mdastFromMarkdown(content, "mdx");
            break;
        } catch (e) {
            if (e instanceof VFileMessage) {
                const errorContext: ErrorContext = {
                    error: e,
                    handled: false,
                    affectedLine: e.line != null ? content.split("\n")[e.line - 1] : undefined,
                };
                errors.push(errorContext);

                if (
                    e.ruleId === RULE_IDS.UNEXPECTED_EOF ||
                    e.ruleId === RULE_IDS.UNEXPECTED_CHARACTER ||
                    e.ruleId === RULE_IDS.ACORN
                ) {
                    const [newContent, handled] = handleUnexpectedEOF(content, e);
                    errorContext.handled = handled;
                    if (handled) {
                        content = newContent;
                        continue;
                    }
                }

                if (e.ruleId === RULE_IDS.UNEXPECTED_CHARACTER || e.ruleId === RULE_IDS.UNEXPECTED_LAZY) {
                    const [newContent, handled] = handleUnexpectedCharacter(content, e);
                    errorContext.handled = handled;
                    if (handled) {
                        content = newContent;
                        continue;
                    }
                }

                if (e.ruleId === RULE_IDS.SPREAD_EXTRA) {
                    const [newContent, handled] = handleSpreadExtra(content, e);
                    errorContext.handled = handled;
                    if (handled) {
                        content = newContent;
                        continue;
                    }
                }

                // fallback 1: escape the current line
                const [newContent, handled] = escapeCurrentLine(content, e);
                errorContext.handled = handled;
                if (handled) {
                    content = newContent;
                    continue;
                }

                // Fallback 2:  as a last resort, if we can't handle the error, we give up and escape all curly braces and alligators
                const newContent2 = escapeAllUnescapedOpeningBrackets(content);
                errorContext.handled = newContent2 !== content;
                if (newContent2 !== content) {
                    content = newContent2;
                    break;
                }

                break;
            } else {
                // if the error does not originate from mdast parser, throw it
                throw e;
            }
        }
    }

    if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.debug(
            "MDX sanitization errors:",
            errors.map((e) => `handled=${e.handled}, rule=${e.error.ruleId}, line=\`${e.affectedLine}\``),
        );
    }

    return content;
}

function escapeAllUnescapedOpeningBrackets(content: string): string {
    return content.replace(/(?<!\\)([{<])/g, "\\$1");
}

function handleUnexpectedEOF(content: string, _e: VFileMessage): [string, boolean] {
    const stack: [number, "{" | "<"][] = [];

    const needsEscaping: number[] = [];

    let i = 0;
    while (i < content.length) {
        const char = content[i++];
        if (char === "\\") {
            continue;
        } else if (char === "{" || char === "<") {
            stack.push([i, char]);
        } else if (char === "}" || char === ">") {
            if (stack.length === 0) {
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [start, openingChar] = stack.pop()!;
            if ((char === ">" && openingChar === "<") || (char === "}" && openingChar === "{")) {
                continue;
            } else {
                needsEscaping.push(start);
            }
        }
    }

    stack.forEach(([start]) => needsEscaping.push(start));

    needsEscaping
        .sort((a, b) => a - b)
        .forEach((start, idx) => {
            content = content.slice(0, start + idx - 1) + "\\" + content.slice(start + idx - 1);
        });

    return [content, needsEscaping.length > 0];
}

function handleSpreadExtra(content: string, e: VFileMessage): [string, boolean] {
    let handled = false;

    const start = e.place == null ? -1 : getStart(content.split("\n"), e.place);
    const lastAlligatorBracket = content.slice(0, start + 1).lastIndexOf("<");
    if (lastAlligatorBracket !== -1) {
        content = content.slice(0, lastAlligatorBracket) + "\\<" + content.slice(lastAlligatorBracket + 1);
        handled = true;
    }

    const lastCurlyBracket = content.slice(Math.max(0, lastAlligatorBracket), start + 1).lastIndexOf("{");
    if (lastCurlyBracket !== -1) {
        content = content.slice(0, lastCurlyBracket) + "\\{" + content.slice(lastCurlyBracket + 1);
        handled = true;
    }

    return [content, handled];
}

function escapeCurrentLine(content: string, e: VFileMessage): [string, boolean] {
    const line = e.line ?? (isPoint(e.place) ? e.place?.line : undefined);

    if (line == null) {
        return [content, false];
    }

    const lines = content.split("\n");

    const originalLine = lines[line - 1];

    if (originalLine == null) {
        return [content, false];
    }

    lines[line - 1] = escapeAllUnescapedOpeningBrackets(originalLine);

    return [lines.join("\n"), lines[line - 1] !== originalLine];
}

function handleUnexpectedCharacter(content: string, e: VFileMessage): [string, boolean] {
    const start = e.place == null ? -1 : getStart(content.split("\n"), e.place);

    const lastAlligatorBracket = content.slice(0, start).lastIndexOf("<");
    const lastCurlyBracket = content.slice(Math.max(0, lastAlligatorBracket), start).lastIndexOf("{");

    const lastCharacterToEscape = Math.max(lastAlligatorBracket, lastCurlyBracket);

    if (lastCharacterToEscape === -1) {
        return [content, false];
    }

    return [content.slice(0, lastCharacterToEscape) + "\\" + content.slice(lastCharacterToEscape), true];
}
