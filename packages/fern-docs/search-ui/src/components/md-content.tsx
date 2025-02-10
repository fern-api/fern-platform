import Markdown, { type Components } from "react-markdown";

import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

export function MarkdownContent({
  children,
  // className,
  components,
  // small,
}: {
  children: string;
  // className?: string;
  components?: Components;
  // small?: boolean;
}) {
  return (
    <Markdown
      components={components}
      remarkPlugins={[remarkGfm, remarkTest]}
      // rehypePlugins={[rehypeThinking]}
      remarkRehypeOptions={{}}
      // className={clsx("prose dark:prose-invert", className, small && "prose-sm")}
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
