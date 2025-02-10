/**
 * A rehype plugin to inject a table of contents into the MDX file.
 *
 * This makes it possible to leverage https://github.com/kentcdodds/mdx-bundler?tab=readme-ov-file#accessing-named-exports on the frontend
 *
 * Inspired by https://github.com/remcohaszing/remark-mdx-frontmatter/blob/main/src/remark-mdx-frontmatter.ts
 */
import { valueToEstree } from "estree-util-value-to-estree";
import { type Root } from "hast";
import { type Plugin } from "unified";

import { makeToc } from "../toc";

export const rehypeToc: Plugin<[], Root> = () => {
  return (ast) => {
    const toc = makeToc(ast);

    ast.children.unshift({
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration", // this will make it possible to access the toc variable in the frontend
              specifiers: [],
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "toc" },
                    init: valueToEstree(toc, { preserveReferences: true }),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
};
