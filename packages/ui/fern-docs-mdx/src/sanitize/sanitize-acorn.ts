import { VFileMessage } from "vfile-message";
import { markdownToMdast } from "../parse.js";
import { getStart } from "../position.js";

/**
 * If the markdown contains unescaped curly braces that are not part of a javascript expression, the acorn parser will fail.
 * This function attempts to sanitize the markdown by escaping the curly braces, but listening for VFileMessage errors.
 *
 * This is not really efficient because it can loop a lot and depends on try-catching errors, but it performs a bit of "magic" to improve quality of life.
 */
export function sanitizeAcorn(content: string): string {
    const loops = 0;

    // these are errors encountered but sanitized
    const errors: VFileMessage[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (loops >= 100) {
            // eslint-disable-next-line no-console
            errors.forEach((e) => console.error(e));
            throw new Error("Infinite Loop Detected: sanitizing acorn failed");
        }

        try {
            markdownToMdast(content, "mdx");
            break;
        } catch (e) {
            if (e instanceof VFileMessage) {
                errors.push(e);

                if (e.ruleId === "spread-extra") {
                    const [newContent, handled] = handleSpreadExtra(content, e);
                    if (handled) {
                        content = newContent;
                        continue;
                    }
                }

                // Fallback: if we can't handle the error, we give up and escape all curly braces
                content = content.replaceAll("{", "\\{");
                break;
            } else {
                // if the error does not originate from mdast parser, throw it
                throw e;
            }
        }
    }

    return content;
}

function handleSpreadExtra(content: string, e: VFileMessage): [string, boolean] {
    let handled = false;

    if (e.place) {
        const start = getStart(content.split("\n"), e.place);
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
    }

    return [content, handled];
}
