import {
  CONTINUE,
  Hast,
  hastMdxJsxElementHastToProps,
  hastToString,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  unknownToMdxJsxAttribute,
  visit,
  type BuildVisitor,
  type VisitorResult,
} from "@fern-docs/mdx";
import GithubSlugger from "github-slugger";
import { getLanguageDisplayName } from "../../api-reference/examples/code-example";

// TODO: combine this with rehype-slug so that we don't have to maintain two slugger instances
const slugger = new GithubSlugger();

type Visitor = BuildVisitor<
  Hast.Root | Hast.Doctype | Hast.ElementContent,
  Hast.Root | Hast.Element | Hast.MdxJsxElement | undefined
>;

export function rehypeFernComponents(): (tree: Hast.Root) => void {
  return function (tree: Hast.Root): void {
    slugger.reset();

    // convert img to Image
    visit(tree, (node) => {
      if (isMdxJsxElementHast(node)) {
        if (node.name === "img") {
          node.name = "Image";
        } else if (node.name === "iframe") {
          node.name = "IFrame";
        } else if (node.name === "table") {
          // DO NOT coerce <table> into <Table> (see: https://buildwithfern.slack.com/archives/C06QKJWD4VD/p1722602687550179)
          // node.name = "Table";
        }
      }
    });

    /**
     * The code below copies the `example` prop of an
     * `EndpointRequestSnippet` to the next `EndpointResponseSnippet` in the
     * tree. For this behavior to take effect, the following conditions
     * must be met:
     *
     * - The `EndpointResponseSnippet` must not have an `example` prop.
     * - The `EndpointResponseSnippet` must have the same `path` and
     * `method` props as the `EndpointRequestSnippet`.
     */

    let request: { path: string; method: string; example: string } | undefined;

    visit(tree, (node) => {
      if (isMdxJsxElementHast(node)) {
        const isRequestSnippet = node.name === "EndpointRequestSnippet";
        const isResponseSnippet = node.name === "EndpointResponseSnippet";

        // check that the current node is a request or response snippet
        if (isRequestSnippet || isResponseSnippet) {
          const { props } = hastMdxJsxElementHastToProps(node);

          if (isRequestSnippet) {
            if (
              typeof props.path === "string" &&
              typeof props.method === "string" &&
              typeof props.example === "string"
            ) {
              // if the request snippet contains all of the
              // required props, record them and continue to the
              // next node
              request = {
                path: props.path,
                method: props.method,
                example: props.example,
              };

              // this avoids the request reference from being
              // reset to undefined at the end of this iteration
              return CONTINUE;
            }
          } else if (
            !props.example &&
            request &&
            request.path === props.path &&
            request.method === props.method
          ) {
            // if the response snippet meets the conditions, copy
            // the example prop from the request snippet
            node.attributes.push(
              unknownToMdxJsxAttribute("example", request.example)
            );
          }

          // reset the request reference in all cases (except when the
          // request snippet props are being recorded)
          request = undefined;
        }
      }

      return CONTINUE; // this line helps avoid a typescript warning
    });

    const visitor: Visitor = (node, index, parent) => {
      if (
        index == null ||
        parent == null ||
        parent.type === "mdxJsxTextElement"
      ) {
        return;
      }

      if (isMdxJsxElementHast(node) && node.name != null) {
        if (node.name === "Steps" || node.name === "StepGroup") {
          return transformSteps(node, index, parent, visitor);
        } else if (node.name === "Tabs" || node.name === "TabGroup") {
          return transformTabs(node, index, parent, visitor);
        } else if (node.name === "AccordionGroup") {
          return transformAccordionGroup(node, index, parent, visitor);
        } else if (node.name === "Tab") {
          return transformTabItem(node, index, parent, visitor);
        } else if (node.name === "Accordion" || node.name === "Expandable") {
          return transformAccordion(node, index, parent, visitor);
        }
      }
    };

    visit(tree, visitor);
  };
}

function transformTabs(
  node: Hast.MdxJsxElement,
  index: number,
  parent: Hast.Root | Hast.Element | Hast.MdxJsxElement,
  visitor: Visitor
): VisitorResult {
  const tabs = node.children
    .filter(isMdxJsxElementHast)
    .filter((child) => child.name === "Tab");

  tabs.forEach((tab, i) => {
    const title = getTitle(tab) ?? `Untitled ${i + 1}`;
    applyGeneratedId(tab, title);
    visit(tab, visitor);
  });

  const child = {
    type: "mdxJsxFlowElement" as const,
    name: "TabGroup",
    attributes: [
      unknownToMdxJsxAttribute(
        "tabs",
        tabs.map((tab) => hastMdxJsxElementHastToProps(tab).props)
      ),
      ...node.attributes,
    ],
    children: [],
  };

  parent.children.splice(index, 1, child);
  return index + 1;
}

function transformTabItem(
  node: Hast.MdxJsxElement,
  index: number,
  parent: Hast.Root | Hast.Element | Hast.MdxJsxElement,
  visitor: Visitor
): VisitorResult {
  const title = getTitle(node) ?? "Untitled";
  applyGeneratedId(node, title);
  visit(node, visitor);

  const { props } = hastMdxJsxElementHastToProps(node);
  const tabs = [props];

  const child = {
    type: "mdxJsxFlowElement" as const,
    name: "TabGroup",
    attributes: [unknownToMdxJsxAttribute("tabs", tabs), ...node.attributes],
    children: [],
  };

  parent.children.splice(index, 1, child);
  return index + 1;
}

function transformAccordionGroup(
  node: Hast.MdxJsxElement,
  index: number,
  parent: Hast.Root | Hast.Element | Hast.MdxJsxElement,
  visitor: Visitor
): VisitorResult {
  const items = node.children
    .filter(isMdxJsxElementHast)
    .filter((child) => child.name === "Accordion");

  items.forEach((accordion, index) => {
    transformAccordion(accordion, index, node, visitor);
  });

  const child = {
    type: "mdxJsxFlowElement" as const,
    name: "AccordionGroup",
    attributes: [
      unknownToMdxJsxAttribute(
        "items",
        items.map((item) => hastMdxJsxElementHastToProps(item).props)
      ),
      ...node.attributes,
    ],
    children: [],
  };
  parent.children.splice(index, 1, child);
  return index + 1;
}

// TODO: handle lone <Step> component
function transformSteps(
  node: Hast.MdxJsxElement,
  index: number,
  parent: Hast.Root | Hast.Element | Hast.MdxJsxElement,
  visitor: Visitor
): VisitorResult {
  const children: Hast.MdxJsxElement[] = [];

  node.children.forEach((child) => {
    if (child.type === "mdxJsxFlowElement" && child.name === "Step") {
      const index = children.length + 1;
      child.attributes = child.attributes.filter((attr) =>
        isMdxJsxAttribute(attr) ? attr.name !== "index" : true
      );
      child.attributes.push(unknownToMdxJsxAttribute("index", index));

      const title = getTitle(child) ?? `Step ${index}`;
      applyGeneratedId(child, title);

      children.push(child);
    } else if (child.type === "element" && child.tagName === "h3") {
      const title = hastToString(child);

      // id may have been set by customHeadingHandler in remarkRehypeHandlers.ts
      const slug =
        (typeof child.properties.id === "string"
          ? child.properties.id
          : undefined) ?? slugger.slug(title);
      children.push({
        type: "mdxJsxFlowElement",
        name: "Step",
        attributes: [
          unknownToMdxJsxAttribute("title", title),
          unknownToMdxJsxAttribute("id", slug),
          unknownToMdxJsxAttribute("index", children.length + 1),
        ],
        children: [],
      });
    } else {
      const lastChild = children[children.length - 1];
      const index = children.length + 1;
      const slug = slugger.slug(`Step ${index}`);
      if (lastChild == null) {
        children.push({
          type: "mdxJsxFlowElement",
          name: "Step",
          attributes: [
            unknownToMdxJsxAttribute("id", slug),
            unknownToMdxJsxAttribute("index", index),
          ],
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

function transformAccordion(
  node: Hast.MdxJsxElement,
  index: number,
  parent: Hast.Root | Hast.Element | Hast.MdxJsxElement,
  visitor: Visitor
): VisitorResult {
  const title = getTitle(node) ?? `Untitled ${index + 1}`;
  applyGeneratedId(node, title);
  const idAttr = node.attributes
    .filter(isMdxJsxAttribute)
    .find((attr) => attr.name === "id");

  // Find parent accordion's ID if it exists
  let parentId: string | undefined;
  if (isMdxJsxElementHast(parent) && parent.name === "Accordion") {
    parentId = parent.attributes
      .filter(isMdxJsxAttribute)
      .find((attr) => attr.name === "id")?.value as string | undefined;
  }

  // If we have both a parent ID and current ID, combine them
  if (parentId && idAttr && typeof idAttr.value === "string") {
    idAttr.value = `${parentId}.${idAttr.value}`;
  }

  // Rest of the updateChildIds logic for nested elements
  if (idAttr && typeof idAttr.value === "string") {
    const baseId = idAttr.value;
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
                  child.type === "element" || child.type === "mdxJsxFlowElement"
              ),
              (item.properties?.id as string) || parentId
            );
          }
        } else if (item.type === "mdxJsxFlowElement") {
          if (item.name === "Accordion") {
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
                  child.type === "element" || child.type === "mdxJsxFlowElement"
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

  visit(node, visitor);

  const { props } = hastMdxJsxElementHastToProps(node);
  const items = [props];

  const child = {
    type: "mdxJsxFlowElement" as const,
    name: "AccordionGroup",
    attributes: [unknownToMdxJsxAttribute("items", items)],
    children: [],
  };

  parent.children.splice(index, 1, child);
  return index + 1;
}

function getTitle(node: Hast.MdxJsxElement): string | undefined {
  const title = node.attributes
    .filter(isMdxJsxAttribute)
    .find((attr) => attr.name === "title")?.value;

  if (typeof title === "string") {
    return title;
  }

  const language = node.attributes
    .filter(isMdxJsxAttribute)
    .find((attr) => attr.name === "language")?.value;

  if (typeof language === "string") {
    return getLanguageDisplayName(language);
  }

  // TODO: handle expression attributes
  return undefined;
}

function applyGeneratedId(node: Hast.MdxJsxElement, title: string): void {
  const id = node.attributes
    .filter(isMdxJsxAttribute)
    .find((attr) => attr.name === "id");
  if (id == null) {
    const slug = slugger.slug(title);
    node.attributes.push(unknownToMdxJsxAttribute("id", slug));
  }
}
