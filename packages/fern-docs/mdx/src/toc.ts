import { Hast } from "@fern-docs/mdx";
import { slug } from "github-slugger";
import type { Doctype, ElementContent, Root } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { SKIP, visit, type BuildVisitor } from "unist-util-visit";
import { hastToString } from "./hast-utils";
import { hastGetBooleanValue } from "./hast-utils/hast-get-boolean-value";
import { isHastElement } from "./hast-utils/is-hast-element";
import { isMdxJsxElementHast } from "./mdx-utils/is-mdx-element";
import { isMdxJsxAttribute } from "./mdx-utils/is-mdx-jsx-attr";

interface FoundHeading {
  depth: number;
  title: string;
  id: string;
}

type Visitor = BuildVisitor<Root | Doctype | ElementContent>;

interface AccordionItemProps {
  title: string;
  id: string;
  toc?: boolean;
  // children: ReactNode;
}

export interface TableOfContentsItem {
  simpleString: string;
  anchorString: string;
  children: TableOfContentsItem[];
}

// TODO: a lot of this logic is duplicated in split-into-sections.ts, consider merging
// TODO: add tests for this function
export function makeToc(
  tree: Root,
  isTocDefaultEnabled = false
): TableOfContentsItem[] {
  const headings: FoundHeading[] = [];

  const visitor: Visitor = (node) => {
    if (isMdxJsxElementHast(node) && node.name === "Accordion") {
      const baseId =
        node.attributes
          .filter(isMdxJsxAttribute)
          .find((attr) => attr.name === "id")?.value ||
        slug(
          node.attributes
            .filter(isMdxJsxAttribute)
            .find((attr) => attr.name === "title")?.value as string
        ) ||
        "";

      if (baseId && typeof baseId === "string") {
        const updateChildIds = (
          items: (Hast.Element | Hast.MdxJsxElement)[],
          parentId: string
        ) => {
          items.forEach((item) => {
            if (item.type === "element") {
              if (item.properties?.id) {
                const oldId = item.properties.id as string;
                item.properties.id = oldId.startsWith(parentId)
                  ? oldId
                  : `${parentId}.${oldId}`;
              }
              if (item.children) {
                updateChildIds(
                  item.children.filter(
                    (child): child is Hast.Element | Hast.MdxJsxElement =>
                      child.type === "element" ||
                      child.type === "mdxJsxFlowElement"
                  ),
                  (item.properties?.id as string) || parentId
                );
              }
            } else if (item.type === "mdxJsxFlowElement") {
              if (item.name === "Accordion") {
                const newId = slug(
                  item.attributes
                    .filter(isMdxJsxAttribute)
                    .find((attr) => attr.name === "title")?.value as string
                );

                item.attributes.push({
                  type: "mdxJsxAttribute",
                  name: "id",
                  value: `${parentId}.${newId}`,
                });

                return;
              }

              const itemIdAttr = item.attributes
                .filter(isMdxJsxAttribute)
                .find((attr) => attr.name === "id");
              if (itemIdAttr && typeof itemIdAttr.value === "string") {
                const oldId = itemIdAttr.value;
                itemIdAttr.value = oldId.startsWith(parentId)
                  ? oldId
                  : `${parentId}.${oldId}`;
              }
              if (item.children) {
                updateChildIds(
                  item.children.filter(
                    (child): child is Hast.Element | Hast.MdxJsxElement =>
                      child.type === "element" ||
                      child.type === "mdxJsxFlowElement"
                  ),
                  (itemIdAttr?.value as string) || parentId
                );
              }
            }
          });
        };

        updateChildIds(
          node.children.filter(
            (child): child is Hast.Element | Hast.MdxJsxElement =>
              child.type === "element" || child.type === "mdxJsxFlowElement"
          ),
          baseId
        );
      }
    }

    // if the node is a <Steps toc={false}>, skip traversing its children
    if (isMdxJsxElementHast(node) && node.name === "StepGroup") {
      const isTocEnabled =
        hastGetBooleanValue(
          node.attributes.find(
            (attr) => isMdxJsxAttribute(attr) && attr.name === "toc"
          )?.value
        ) ?? isTocDefaultEnabled;

      if (isTocEnabled) {
        node.children.forEach((child) => {
          if (child.type === "mdxJsxFlowElement" && child.name === "Step") {
            const id = child.attributes
              .filter(isMdxJsxAttribute)
              .find((attr) => attr.name === "id")?.value;
            const title = child.attributes
              .filter(isMdxJsxAttribute)
              .find((attr) => attr.name === "title")?.value;
            if (
              id == null ||
              typeof id !== "string" ||
              title == null ||
              typeof title !== "string"
            ) {
              return;
            }
            headings.push({ depth: 3, id, title });

            visit(child, visitor);
          }
        });
      }
      return SKIP;
    }

    // parse markdown headings
    const rank = headingRank(node);
    if (isHastElement(node) && rank != null) {
      const id = node.properties.id;
      if (id == null || typeof id !== "string") {
        return;
      }

      const title = hastToString(node);

      headings.push({ depth: rank, id, title });
    }

    // parse mdx-jsx headings i.e. `<h1 id="my-id">My Title</h1>`
    if (
      isMdxJsxElementHast(node) &&
      node.name != null &&
      ["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.name)
    ) {
      const id = node.attributes.find(
        (attr) => attr.type === "mdxJsxAttribute" && attr.name === "id"
      )?.value;
      if (id == null || typeof id !== "string") {
        return;
      }

      const depth = parseInt(node.name[1] ?? "0");
      if (depth < 1 || depth > 6) {
        // depth must be between 1 and 6
        return;
      }

      const title = hastToString(node);
      headings.push({ depth, id, title });
    }

    if (isMdxJsxElementHast(node) && node.name === "TabGroup") {
      const attributes = node.attributes.filter(isMdxJsxAttribute);
      const itemsAttr = attributes.find((attr) => attr.name === "tabs");
      const tocAttr = attributes.find((attr) => attr.name === "toc");
      const isParentTocEnabled =
        hastGetBooleanValue(tocAttr?.value) ?? isTocDefaultEnabled;

      if (itemsAttr?.value == null || typeof itemsAttr.value === "string") {
        return;
      }

      try {
        const items = JSON.parse(itemsAttr.value.value) as AccordionItemProps[];
        items.forEach((item) => {
          const isTocEnabled = item.toc ?? isParentTocEnabled;
          if (item.title.trim().length === 0 || !isTocEnabled) {
            return;
          }
          headings.push({
            depth: 6,
            id: item.id ?? slug(item.title),
            title: item.title,
          });
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (isMdxJsxElementHast(node) && node.name === "AccordionGroup") {
      const attributes = node.attributes.filter(isMdxJsxAttribute);
      const itemsAttr = attributes.find((attr) => attr.name === "items");
      const tocAttr = attributes.find((attr) => attr.name === "toc");
      const isParentTocEnabled =
        hastGetBooleanValue(tocAttr?.value) ?? isTocDefaultEnabled;

      if (itemsAttr?.value == null || typeof itemsAttr.value === "string") {
        return;
      }

      try {
        const items = JSON.parse(itemsAttr.value.value) as AccordionItemProps[];
        items.forEach((item) => {
          const isTocEnabled = item.toc ?? isParentTocEnabled;
          if (item.title.trim().length === 0 || !isTocEnabled) {
            return;
          }
          headings.push({
            depth: 6,
            id: item.id ?? slug(item.title),
            title: item.title,
          });
        });
      } catch (e) {
        console.error(e);
      }
    }

    return;
  };

  visit(tree, visitor);

  const minDepth = Math.min(...headings.map((heading) => heading.depth));
  return makeTree(headings, minDepth);
}

function makeTree(
  headings: FoundHeading[],
  depth: number = 1
): TableOfContentsItem[] {
  const tree: TableOfContentsItem[] = [];

  while (headings.length > 0) {
    const firstToken = headings[0];
    if (!firstToken) {
      break;
    }

    // if the next heading is at a higher level
    if (firstToken.depth < depth) {
      break;
    }

    if (firstToken.depth === depth) {
      const token = headings.shift();
      if (token != null) {
        tree.push({
          simpleString: token.title.trim(),
          anchorString: token.id.trim(),
          children: makeTree(headings, depth + 1),
        });
      }
    } else {
      tree.push(...makeTree(headings, depth + 1));
    }
  }

  return tree;
}
