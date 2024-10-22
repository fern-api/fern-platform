import type { Program } from "estree";
import { walk } from "estree-walker";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

interface Options {
    /**
     * This is the global scope of identifiers that are allowed to be consumed by acorn.
     */
    allowedIdentifiers?: string[];
}

/**
 * Not allowed: Promise, crypto, etc.
 *
 * Note: `props` will be used by @mdx-js/esbuild
 */
const ALLOWED_GLOBAL_IDENTIFIERS: string[] = ["Math", "Date", "RegExp", "JSON", "Set", "Map", "URL", "props"];

/**
 * This plugin makes a best effort to strip away any acorn expressions that are not valid.
 *
 * - some global elements are allowed, such as Math, Date, JSON, etc.
 * - await expressions are not allowed, and will be escaped.
 */
export function remarkSanitizeAcorn({ allowedIdentifiers = [] }: Options = {}): (tree: Root) => void {
    return (tree) => {
        const allowedIdentifiersSet = new Set([...ALLOWED_GLOBAL_IDENTIFIERS, ...allowedIdentifiers]);

        // add identifiers from ESM to the allowed identifiers set
        // i.e. `export const foo = 1;` should avoid escaping `foo`.
        visit(tree, (node, index, parent) => {
            if (node.type === "mdxjsEsm") {
                const { identifiers, isAwaited } = collectIdentifiers(node.data?.estree);
                if (isAwaited && parent && index != null) {
                    // escape the expression if it contains identifiers that are not allowed:
                    parent.children[index] = {
                        type: "text",
                        value: `{${node.value}}`,
                    };
                    return "skip";
                }
                identifiers.forEach((id) => allowedIdentifiersSet.add(id));
            }
            return;
        });

        // HACK: attempt to extract identifiers that are in-use via JSX attributes.
        // if any identifiers are present in JSX attributes, add them to the allowed identifiers set
        // so that they're not escaped within acorns.
        visit(tree, (node) => {
            if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
                if (node.name) {
                    allowedIdentifiersSet.add(node.name);
                }

                node.attributes.forEach((attr) => {
                    if (attr.type === "mdxJsxAttribute" && attr.value && typeof attr.value !== "string") {
                        const { identifiers } = collectIdentifiers(attr.value.data?.estree);
                        identifiers.forEach((id) => allowedIdentifiersSet.add(id));
                    }
                });
            }
        });

        visit(tree, (node, index, parent) => {
            if (node.type === "mdxTextExpression" || node.type === "mdxFlowExpression") {
                const { identifiers, isAwaited } = collectIdentifiers(node.data?.estree);
                if (identifiers.every((identifier) => allowedIdentifiersSet.has(identifier)) && !isAwaited) {
                    // continue if all identifiers are allowed and the expression is not awaited.
                    return;
                } else if (parent && index != null) {
                    // escape the expression if it contains identifiers that are not allowed:
                    parent.children[index] = {
                        type: "text",
                        value: `{${node.value}}`,
                    };
                    return "skip";
                }
            }

            return;
        });
    };
}

function collectIdentifiers(estree: Program | null | undefined): { identifiers: string[]; isAwaited: boolean } {
    let isAwaited = false;

    if (!estree) {
        return { identifiers: [], isAwaited };
    }

    const identifiers = new Set<string>();

    // collect identifiers that can cause acorn evaluation to fail
    walk(estree, {
        enter(node) {
            if (node.type === "AwaitExpression") {
                isAwaited = true;
            }

            if (node.data?._mdxSkipSanitization) {
                return;
            }

            if (node.type === "Property") {
                (node.key.data ??= {})._mdxSkipSanitization = true;
                return;
            }

            if (node.type === "MemberExpression") {
                (node.property.data ??= {})._mdxSkipSanitization = true;
                return;
            }

            if (node.type === "Identifier" || node.type === "JSXIdentifier") {
                identifiers.add(node.name);
            }
        },
    });

    return { identifiers: Array.from(identifiers), isAwaited };
}
