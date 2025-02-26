/**
 * A remark plugin to inject an ESM export into the MDX file.
 *
 * Inspired by https://github.com/remcohaszing/remark-mdx-frontmatter/blob/main/src/remark-mdx-frontmatter.ts
 */
import type { Statement } from "estree";
import { name as isIdentifierName } from "estree-util-is-identifier-name";
import { valueToEstree } from "estree-util-value-to-estree";
import type { Root } from "mdast";
import type { Plugin } from "unified";

export interface RemarkInjectEsmOptions {
  scope?: Record<string, unknown>;
}

/**
 * A remark plugin to inject scope of variables into the MDX file.
 *
 * @param options Optional options to configure the output.
 * @returns A unified transformer.
 */
export const remarkInjectEsm: Plugin<[RemarkInjectEsmOptions?], Root> = (
  { scope = {} } = { scope: {} }
) => {
  const keys = Object.keys(scope);
  if (keys.some((key) => !isIdentifierName(key))) {
    throw new Error(
      `Scope keys should be valid identifiers, got: ${JSON.stringify(keys)}`
    );
  }

  return (ast) => {
    if (Object.keys(scope).length === 0) {
      return;
    }

    ast.children.unshift({
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: Object.entries(scope).map(
            ([key, value]): Statement => ({
              type: "VariableDeclaration",
              kind: "const",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: { type: "Identifier", name: key },
                  init: valueToEstree(value, { preserveReferences: true }),
                },
              ],
            })
          ),
        },
      },
    });
  };
};
