import { rendererRich, transformerTwoslash } from "@shikijs/twoslash";
import type { Element, ElementContent } from "hast";
import { type Highlighter, getSingletonHighlighter } from "shiki";

import { DEFAULT, THEMES } from "@fern-docs/components/syntax-highlighter";
import { Hast, Unified, toTree, visit } from "@fern-docs/mdx";

export const rehypeShikiTwoslash: Unified.Plugin<[], Hast.Root> = () => {
  let highlighter: Highlighter;

  return async (tree) => {
    highlighter ??= await getSingletonHighlighter({
      langs: ["typescript"],
    });

    await highlighter.loadTheme(
      THEMES.light.typescript ?? THEMES.light[DEFAULT],
      THEMES.dark.typescript ?? THEMES.dark[DEFAULT]
    );

    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || parent == null || index == null) {
        return;
      }

      const codeNode = node.children[0];
      if (
        codeNode == null ||
        codeNode.type !== "element" ||
        codeNode.tagName !== "code"
      ) {
        return;
      }

      if (codeNode.data?.meta?.includes("twoslash")) {
        const code = codeNode.children[0];
        if (code?.type === "text") {
          const hast = highlighter.codeToHast(code.value, {
            lang: "typescript",
            themes: {
              light: THEMES.light.typescript ?? THEMES.light[DEFAULT],
              dark: THEMES.dark.typescript ?? THEMES.dark[DEFAULT],
            },
            transformers: [
              transformerTwoslash({
                renderer: rendererRich({
                  renderMarkdown: function (markdown) {
                    const { hast } = toTree(markdown, {
                      format: "md",
                      sanitize: false,
                    });
                    return hast.children as ElementContent[];
                  },
                }),
              }),
            ],
          });

          if (code.value.includes("showEmit")) {
            console.log("hast:", hast);
          }

          const firstChild = hast.children[0];
          if (firstChild != null && firstChild.type === "element") {
            parent.children[index] = firstChild;
          }
        }
      }
    });
  };
};
