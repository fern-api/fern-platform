// inspired by https://github.com/remcohaszing/hast-util-properties-to-mdx-jsx-attributes
import { propertiesToMdxJsxAttributes } from "hast-util-properties-to-mdx-jsx-attributes";
import rangeParser from "parse-numeric-range";

import {
  Hast,
  SKIP,
  Unified,
  isMdxJsxElementHast,
  mdastFromMarkdown,
  visit,
} from "@fern-docs/mdx";

export const rehypeCodeBlock: Unified.Plugin<[], Hast.Root> = () => {
  return (tree) => {
    /**
     * Convert <pre><code>...</code></pre> to <CodeBlock>...</CodeBlock>
     */
    visit(tree, "element", (node, index, parent) => {
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

      const meta = codeNode.data?.meta ?? "";
      const replacement = mdastFromMarkdown(
        `<CodeBlock ${migrateMeta(meta)} />`,
        "mdx"
      ).children[0];

      if (!replacement || !isMdxJsxElementHast(replacement)) {
        return;
      }

      replacement.position = codeNode.position;
      replacement.attributes.unshift(
        ...propertiesToMdxJsxAttributes(node.properties),
        ...propertiesToMdxJsxAttributes(codeNode.properties)
      );

      const className =
        node.properties?.class ??
        node.properties?.className ??
        codeNode.properties?.class ??
        codeNode.properties?.className;

      if (typeof className === "string" && className.startsWith("language-")) {
        replacement.attributes.unshift({
          type: "mdxJsxAttribute",
          name: "language",
          value: className.replace("language-", ""),
        });
      }

      if (
        codeNode.children[0]?.type === "text" ||
        codeNode.children[0]?.type === "raw"
      ) {
        const code = codeNode.children[0].value;
        replacement.attributes.unshift({
          type: "mdxJsxAttribute",
          name: "code",
          value: code,
        });
      }

      parent.children[index] = replacement;
      return SKIP;
    });

    /**
     * unravel <CodeBlock><CodeBlock>...</CodeBlock></CodeBlock> into <CodeBlock>...</CodeBlock>
     */
    visit(tree, (node, index, parent) => {
      if (
        index == null ||
        parent == null ||
        !isMdxJsxElementHast(node) ||
        node.name !== "CodeBlock"
      ) {
        return;
      }
      const child = node.children[0];
      if (child && isMdxJsxElementHast(child) && child.name === "CodeBlock") {
        node.attributes = [...node.attributes, ...child.attributes];
        node.children = [];
      }
      return SKIP;
    });
  };
};

function migrateMeta(metastring: string): string {
  metastring = metastring.trim();

  if (metastring === "") {
    return metastring;
  }

  // migrate {1-3} to highlight={[1, 2, 3]}
  // but do NOT migrate {1} to {[1]}
  while (true) {
    const match = metastring.match(/\{([0-9,-]+)\}/g);
    if (match?.index == null) {
      break;
    }
    const [full, expr] = match;
    if (!expr?.includes(",") && !expr?.includes("-")) {
      break;
    }

    const start = match.index;
    const end = start + full.length;
    const range = rangeParser(expr ?? "");

    let prepend = "";
    if (start === 0 || metastring[start - 1] === " ") {
      prepend = "highlight=";
    }

    metastring =
      metastring.slice(0, start) +
      `${prepend}{[${range.join(",")}]}` +
      metastring.slice(end);
  }

  // migrate title=123 to title={123}
  while (true) {
    const match = metastring.match(/=([0-9]+)/g);
    if (match?.index == null) {
      break;
    }
    const [full, expr] = match;
    const start = match.index;
    const end = start + full.length;

    metastring =
      metastring.slice(0, start) + `title={${expr}}` + metastring.slice(end);
  }

  // migrate "abcd" to title="abcd"
  if (metastring.startsWith('"') && metastring.endsWith('"')) {
    return `title=${metastring}`;
  }

  // migrate abcd to title="abcd"
  if (!metastring.includes("=") && !metastring.includes("{")) {
    return `title="${metastring}"`;
  }

  return metastring;
}
