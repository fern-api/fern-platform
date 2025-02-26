import type { Program } from "estree";
import { walk } from "estree-walker";
import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import { visit } from "unist-util-visit";

export function extractJsxFromEstree(estree: Program): {
  jsxElements: string[];
  esmElements: string[];
} {
  const jsxElements = new Set<string>();
  const esmElements = new Set<string>();

  walk(estree, {
    enter(node) {
      if (node.type === "JSXIdentifier") {
        jsxElements.add(node.name);
      }
    },
  });

  return {
    jsxElements: Array.from(jsxElements),
    esmElements: Array.from(esmElements),
  };
}

/**
 * Extracts the names of the jsx elements used in the tree, as well as the names of the esm elements assigned to variables.
 * However, if the jsx element consumes an esm element, it will not be included in the result of `jsxElements`.
 * This is helpful for sanitizing user-provided content, so that we avoid having unknown elements throw the entire page.
 */
export function extractJsx(tree: HastRoot | MdastRoot): {
  jsxElements: string[];
  esmElements: string[];
} {
  const jsxElements = new Set<string>();
  const esmElements = new Set<string>();

  visit(tree, (node) => {
    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      if (node.name != null) {
        jsxElements.add(node.name);
      }

      // extract esm elements from attributes
      node.attributes.forEach((attribute) => {
        if (
          attribute.type === "mdxJsxAttribute" &&
          attribute.value &&
          typeof attribute.value !== "string" &&
          attribute.value.data?.estree
        ) {
          const extracted = extractJsxFromEstree(attribute.value.data.estree);
          extracted.jsxElements.forEach((name) => jsxElements.add(name));
          extracted.esmElements.forEach((name) => esmElements.add(name));
        }
      });
    }

    // extract esm elements from mdxjsEsm
    if (
      (node.type === "mdxFlowExpression" ||
        node.type === "mdxTextExpression" ||
        node.type === "mdxjsEsm") &&
      node.data?.estree
    ) {
      const extracted = extractJsxFromEstree(node.data.estree);
      extracted.jsxElements.forEach((name) => jsxElements.add(name));
      extracted.esmElements.forEach((name) => esmElements.add(name));
    }
  });

  return {
    jsxElements: Array.from(jsxElements)
      // filter out esm elements
      .filter((name) => !esmElements.has(name))
      // filter out fragments and intrinsic jsx elements
      .filter(
        (name) => name !== "Fragment" && name.match(/^[A-Z][a-zA-Z0-9]*$/)
      ),

    esmElements: Array.from(esmElements).filter((name) =>
      name.match(/^[A-Z][a-zA-Z0-9]*$/)
    ),
  };
}
