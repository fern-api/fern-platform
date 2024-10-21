import { Parser } from "acorn";
import acornJsx from "acorn-jsx";
import { Program } from "estree";
import { walk } from "estree-walker";
import { Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";
import { getPosition } from "../position.js";

interface Options {
    allowedIdentifiers?: string[];
}

const ALLOWED_OBJECTS: string[] = ["Math", "Date", "RegExp", "JSON", "Set", "Map"];

// makes a best effort to strip away any acorn expressions that are not valid
export function remarkSanitizeAcorn({ allowedIdentifiers = [] }: Options = {}): (tree: Root) => undefined {
    return (tree) => {
        const allowedIdentifiersSet = new Set([...ALLOWED_OBJECTS, ...allowedIdentifiers]);

        visit(tree, (node, index, parent) => {
            if (node.type === "mdxTextExpression") {
                const identifiers = collectIdentifiers(node.data?.estree);
                if (identifiers.every((identifier) => allowedIdentifiersSet.has(identifier))) {
                    return;
                } else if (parent && index != null) {
                    parent.children[index] = {
                        type: "text",
                        value: `{${node.value}}`,
                    };
                    return "skip";
                }
            }

            // add identifiers from ESM to the allowed identifiers set
            // i.e. `export const foo = 1;` should avoid escaping `foo` in future acorns.
            if (node.type === "mdxjsEsm") {
                const identifiers = collectIdentifiers(node.data?.estree);
                identifiers.forEach((id) => allowedIdentifiersSet.add(id));
                return;
            }

            // if any identifiers are present in JSX attributes, add them to the allowed identifiers set
            // so that they're not escaped in future acorns.
            if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
                node.attributes.forEach((attr) => {
                    if (attr.type === "mdxJsxAttribute" && attr.value && typeof attr.value !== "string") {
                        const identifiers = collectIdentifiers(attr.value.data?.estree);
                        identifiers.forEach((id) => allowedIdentifiersSet.add(id));
                    }
                });
            }

            return;
        });
    };
}

function collectIdentifiers(estree: Program | null | undefined): string[] {
    if (!estree) {
        return [];
    }

    const identifiers = new Set<string>();

    walk(estree, {
        enter(node) {
            if (node.type === "MemberExpression" && node.object.type === "Identifier") {
                identifiers.add(node.object.name);
                this.skip();
                return;
            }

            if (node.type === "Identifier") {
                identifiers.add(node.name);
            }
        },
    });

    return Array.from(identifiers);
}

export function preSanitizeAcorn(content: string): string {
    const parser = Parser.extend(acornJsx());

    // don't parse mdx in here
    const noFrillsMdast = fromMarkdown(content);
    const lines = content.split("\n");

    let offset = 0;

    visit(noFrillsMdast, (node) => {
        // avoid sanitizing code blocks
        if (node.type === "code" || node.type === "inlineCode") {
            return "skip";
        }

        if (!node.position) {
            return;
        }

        const { start } = getPosition(lines, node.position);

        const braceStack: ["{" | "<", number][] = [];
        let popStack: ["{" | "<", number][] = [];

        while (start + offset < content.length) {
            const char = content[start + offset];

            // special case to skip over export statements
            if (content.slice(start + offset, "export ".length) === "export ") {
                const nextNewline = content.indexOf("\n", start + offset);

                if (nextNewline === -1) {
                    break;
                }

                offset = nextNewline - start;
                continue;
            }

            if (char === "{" || char === "<") {
                braceStack.push([char, start + offset]);
            } else if (char === "}" || char === ">") {
                if (braceStack.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const [brace, index] = braceStack.pop()!;

                    // if we're closing a JSX tag that is invalid, we need to escape all of the opening braces contained buy it
                    if (brace === "<") {
                        popStack.forEach(([brace, index]) => {
                            content = content.slice(0, index) + `\\${brace}` + content.slice(index + 1);
                        });
                    }

                    if (braceStack.length === 0) {
                        const expression = content.slice(index + 1, start + offset);

                        // // skip spread operator
                        // if (expression.trim().startsWith("...")) {
                        //     offset++;
                        //     continue;
                        // }

                        // test if expression is a valid acorn expression, otherwise escape it
                        try {
                            parser.parse(expression, { ecmaVersion: 2024, sourceType: "module", locations: true });
                        } catch (e) {
                            content = content.slice(0, index) + `\\${brace}` + content.slice(index + 1);
                            offset++;
                        }

                        popStack = [];
                    } else {
                        popStack.push([brace, index]);
                    }
                } else {
                    // Unmatched closing brace, does not need to be escaped
                }
            }
            offset++;
        }

        // If there are any unmatched opening braces left, escape them
        while (braceStack.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [brace, index] = braceStack.pop()!;
            content = content.slice(0, index) + `\\${brace}` + content.slice(index + 1);
        }

        return;
    });

    return content;
}
