import {
  isMdxJsxElementHast,
  unknownToMdxJsxAttribute,
  type MdxJsxElementHast,
} from "@fern-docs/mdx";
import type { Doctype, Element, ElementContent, Root } from "hast";
import { visit, type BuildVisitor, type VisitorResult } from "unist-util-visit";

type Visitor = BuildVisitor<
  Root | Doctype | ElementContent,
  Root | Element | MdxJsxElementHast | undefined
>;

/**
 * Migrates the ###-based steps syntax to the new `StepGroup` and `Step` components.
 */
export function rehypeMigrateSteps(): (tree: Root) => void {
  return function (tree: Root): void {
    const visitor: Visitor = (node, index, parent) => {
      if (isMdxJsxElementHast(node) && index != null && parent != null) {
        if (node.name === "Steps" || node.name === "StepGroup") {
          return migrateSteps(node, index, parent, visitor);
        }
      }
    };

    visit(tree, visitor);
  };
}

function migrateSteps(
  node: MdxJsxElementHast,
  index: number,
  parent: Root | Element | MdxJsxElementHast,
  visitor: Visitor
): VisitorResult {
  const children: MdxJsxElementHast[] = [];

  node.children.forEach((child) => {
    if (child.type === "element" && child.tagName === "h3") {
      const attributes = [unknownToMdxJsxAttribute("title", child)];
      if (typeof child.properties.id === "string") {
        attributes.push(unknownToMdxJsxAttribute("id", child.properties.id));
      }
      children.push({
        type: "mdxJsxFlowElement",
        name: "Step",
        attributes,
        children: [],
      });
    } else if (
      isMdxJsxElementHast(child) &&
      child.name?.toLowerCase() === "h3"
    ) {
      const attributes = [
        ...node.attributes,
        unknownToMdxJsxAttribute("title", child),
      ];
      children.push({
        type: "mdxJsxFlowElement",
        name: "Step",
        attributes,
        children: [],
      });
    } else {
      const lastChild = children[children.length - 1];
      if (lastChild == null) {
        children.push({
          type: "mdxJsxFlowElement",
          name: "Step",
          attributes: [unknownToMdxJsxAttribute("title", "Untitled")],
          children: [child],
        });
      } else {
        lastChild.children.push(child);
      }
    }
  });

  const child = {
    type: "mdxJsxFlowElement" as const,
    name: "StepGroup",
    attributes: node.attributes,
    children,
  };

  visit(child, visitor);
  parent.children.splice(index, 1, child);
  return index + 1;
}
