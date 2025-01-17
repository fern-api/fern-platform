import {
  hastMdxJsxElementHastToProps,
  isMdxJsxAttribute,
  isMdxJsxElementHast,
  unknownToMdxJsxAttribute,
  type MdxJsxElementHast,
} from "@fern-docs/mdx";
import GithubSlugger from "github-slugger";
import type { Doctype, Element, ElementContent, Root } from "hast";
import { toString } from "hast-util-to-string";
import {
  CONTINUE,
  visit,
  type BuildVisitor,
  type VisitorResult,
} from "unist-util-visit";

// TODO: combine this with rehype-slug so that we don't have to maintain two slugger instances
const slugger = new GithubSlugger();

type Visitor = BuildVisitor<
  Root | Doctype | ElementContent,
  Root | Element | MdxJsxElementHast | undefined
>;

export function rehypeFernComponents(): (tree: Root) => void {
  return function (tree: Root): void {
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
        } else if (node.name === "embed") {
          node.name = "Embed";
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
        } else if (node.name === "Tab") {
          return transformTabItem(node, index, parent, visitor);
        }
      }
    };

    visit(tree, visitor);
  };
}

function transformTabs(
  node: MdxJsxElementHast,
  index: number,
  parent: Root | Element | MdxJsxElementHast,
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
  node: MdxJsxElementHast,
  index: number,
  parent: Root | Element | MdxJsxElementHast,
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

// TODO: handle lone <Step> component
function transformSteps(
  node: MdxJsxElementHast,
  index: number,
  parent: Root | Element | MdxJsxElementHast,
  visitor: Visitor
): VisitorResult {
  const children: MdxJsxElementHast[] = [];

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
      const title = toString(child);

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

// function transformAccordion(
//   node: MdxJsxElementHast,
//   index: number,
//   parent: Root | Element | MdxJsxElementHast,
//   visitor: Visitor
// ): VisitorResult {
//   const title = getTitle(node) ?? "Untitled";
//   applyGeneratedId(node, title);
//   visit(node, visitor);

//   const { props } = hastMdxJsxElementHastToProps(node);

//   const items = [props];

//   const child = {
//     type: "mdxJsxFlowElement" as const,
//     name: "AccordionGroup",
//     attributes: [unknownToMdxJsxAttribute("items", items)],
//     children: [],
//   };

//   parent.children.splice(index, 1, child);
//   return index + 1;
// }

function getTitle(node: MdxJsxElementHast): string | undefined {
  const title = node.attributes
    .filter(isMdxJsxAttribute)
    .find((attr) => attr.name === "title")?.value;
  // TODO: handle expression attributes
  return typeof title === "string" ? title : undefined;
}

function applyGeneratedId(node: MdxJsxElementHast, title: string): void {
  const id = node.attributes
    .filter(isMdxJsxAttribute)
    .find((attr) => attr.name === "id");
  if (id == null) {
    const slug = slugger.slug(title);
    node.attributes.push(unknownToMdxJsxAttribute("id", slug));
  }
}
