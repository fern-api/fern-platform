// inspired by https://github.com/remcohaszing/hast-util-properties-to-mdx-jsx-attributes
import { compact, flatten } from "es-toolkit/array";
import { escape } from "es-toolkit/string";
import { propertiesToMdxJsxAttributes } from "hast-util-properties-to-mdx-jsx-attributes";
import parseNumericRange from "parse-numeric-range";

import {
  Hast,
  Mdast,
  SKIP,
  Unified,
  isMdxJsxElementHast,
  mdastFromMarkdown,
  visit,
} from "@fern-docs/mdx";

export const rehypeCodeBlock: Unified.Plugin<[], Hast.Root> = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (!isMdxJsxElementHast(node)) {
        return;
      }

      if (node.name === "CodeBlocks") {
        node.name = "CodeGroup";
      }
    });

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
      let replacement: Mdast.RootContent | undefined;
      try {
        replacement = mdastFromMarkdown(
          `<CodeBlock ${migrateMeta(meta)} />`,
          "mdx"
        ).children[0];
      } catch (error) {
        console.error(error);
        // if we fail to parse the meta, just wrap it in a title
        const props = meta.trim().length === 0 ? "" : `title="${escape(meta)}"`;
        replacement = mdastFromMarkdown(`<CodeBlock ${props} />`, "mdx")
          .children[0];
      }

      if (!replacement || !isMdxJsxElementHast(replacement)) {
        return;
      }

      replacement.position = codeNode.position;
      replacement.attributes.unshift(
        ...propertiesToMdxJsxAttributes(node.properties),
        ...propertiesToMdxJsxAttributes(codeNode.properties)
      );

      const language = compact(flatten([codeNode.properties?.className]))
        .find(
          (className): className is string =>
            typeof className === "string" && className.startsWith("language-")
        )
        ?.replace("language-", "");

      if (language) {
        replacement.attributes.unshift({
          type: "mdxJsxAttribute",
          name: "language",
          value: language,
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
        node.children = child.children;
        return [SKIP, index];
      }
      return;
    });
  };
};

export function migrateMeta(metastring: string): string {
  metastring = metastring.trim();

  if (metastring === "") {
    return metastring;
  }

  // migrate {1-3} to {[1, 2, 3]}
  // but do NOT migrate {1} to {[1]}
  metastring = metastring.replaceAll(/\{([0-9,\s-]+)\}/g, (original, expr) => {
    if (expr?.includes(",") || expr?.includes("-")) {
      return `{[${parseNumericRange(expr ?? "")}]}`;
    }
    return original;
  });

  // if matches {[, it must be preceded by a `=` otherwise prefix with `highlight=`
  const match = metastring.search(/\{[0-9,\s[\]-]*\}/);
  if (match !== -1 && metastring.slice(match + 1, match + 3) !== "...") {
    if (match === 0 || metastring[match - 1] !== "=") {
      metastring =
        metastring.slice(0, match) + "highlight=" + metastring.slice(match);
    }
  }

  // migrate test=123 to test={123}
  metastring = metastring.replaceAll(/=([0-9]+)/g, (_original, expr) => {
    return `={${expr}}`;
  });

  metastring = metastring.replaceAll(/=([a-zA-Z]+)/g, (original, expr) => {
    // don't replace booleans
    if (expr === "true" || expr === "false") {
      return original;
    }
    return `="${expr}"`;
  });

  // migrate "abcd" to title="abcd"
  if (metastring.startsWith('"') && metastring.endsWith('"')) {
    return `title=${metastring}`;
  }

  if (metastring.startsWith("'") && metastring.endsWith("'")) {
    return `title="${metastring.slice(1, -1).replace(/"/g, '\\"')}"`;
  }

  // migrate abcd to title="abcd"
  // exclude any characters wrapped in {}
  if (
    !metastring.includes("={") &&
    !metastring.includes('="') &&
    !metastring.includes("{...") &&
    !/\{[^}]*[a-zA-Z][^}]*\}/.test(metastring)
  ) {
    return `title="${metastring.replace(/"/g, '\\"')}"`;
  }

  metastring = metastring.replaceAll(
    /^([^{]*?)(?=[a-zA-Z]+=)/g,
    (_original, text) => {
      if (text.trim() === "") {
        return "";
      }
      return `title="${text.trim()}" `;
    }
  );

  // if a title hasn't been found so far, make sure it is not hidden in meta string
  if (!metastring.includes("title=")) {
    // ignore special words, anything in curly braces
    const parseForTitle = metastring
      .replaceAll("wordWrap", "")
      .replaceAll(/([^=]+)={(.*?)}/g, "")
      .replaceAll(/{(.*?)}/g, "");
    if (parseForTitle !== "") {
      metastring = metastring.replace(
        parseForTitle,
        ` title="${parseForTitle.trim()}" `
      );
    }
  }

  return metastring;
}
