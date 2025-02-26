import Markdown, { type Components } from "react-markdown";

import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

export function MarkdownContent({
  children,
  components,
}: {
  children: string;
  components?: Components;
}) {
  return (
    <Markdown
      components={components}
      remarkPlugins={[remarkGfm, remarkTest]}
      remarkRehypeOptions={{}}
    >
      {children.replaceAll("```[^", "```\n[^")}
    </Markdown>
  );
}

function remarkTest() {
  return (tree: Root) => {
    visit(tree, "text", (node) => {
      // Remove footnote references that aren't parsed
      const match = node.value.matchAll(/\[\^[0-9]+\]/g);
      if (match) {
        for (const m of match) {
          node.value = node.value.replace(m[0], "");
        }
      }

      // remove all partial brackets
      const bracketMatch = node.value.matchAll(/\[.*$|!\[.*$/g);
      if (bracketMatch) {
        for (const m of bracketMatch) {
          if (!m[0].endsWith("]")) {
            node.value = node.value.replace(m[0], "");
          }
        }
      }
    });
  };
}
