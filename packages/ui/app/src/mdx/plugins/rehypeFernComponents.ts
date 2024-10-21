import { isMdxJsxAttribute, isMdxJsxFlowElement, toAttribute } from "@fern-ui/fern-docs-mdx";
import GithubSlugger from "github-slugger";
import type { Doctype, Element, ElementContent, Root } from "hast";
import { toString } from "hast-util-to-string";
import { h } from "hastscript";
import type { MdxJsxAttributeValueExpression, MdxJsxFlowElementHast, MdxJsxTextElementHast } from "mdast-util-mdx-jsx";
import { CONTINUE, visit, type BuildVisitor, type VisitorResult } from "unist-util-visit";

// TODO: combine this with rehype-slug so that we don't have to maintain two slugger instances
const slugger = new GithubSlugger();

type Visitor = BuildVisitor<
    Root | Doctype | ElementContent,
    Root | Element | MdxJsxTextElementHast | MdxJsxFlowElementHast | undefined
>;

export function rehypeFernComponents(): (tree: Root) => void {
    return function (tree: Root): void {
        slugger.reset();

        // convert img to Image
        visit(tree, (node) => {
            if (isMdxJsxFlowElement(node)) {
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
            if (isMdxJsxFlowElement(node)) {
                const isRequestSnippet = node.name === "EndpointRequestSnippet";
                const isResponseSnippet = node.name === "EndpointResponseSnippet";

                // check that the current node is a request or response snippet
                if (isRequestSnippet || isResponseSnippet) {
                    const props = collectProps(node);

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
                        node.attributes.push(toAttribute("example", request.example));
                    }

                    // reset the request reference in all cases (except when the
                    // request snippet props are being recorded)
                    request = undefined;
                }
            }

            return CONTINUE; // this line helps avoid a typescript warning
        });

        const visitor: Visitor = (node, index, parent) => {
            if (index == null || parent == null || parent.type === "mdxJsxTextElement") {
                return;
            }

            if (isMdxJsxFlowElement(node) && node.name != null) {
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
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
    visitor: Visitor,
): VisitorResult {
    const tabs = node.children.filter(isMdxJsxFlowElement).filter((child) => child.name === "Tab");

    tabs.forEach((tab, i) => {
        const title = getTitle(tab) ?? `Untitled ${i + 1}`;
        applyGeneratedId(tab, title);
        visit(tab, visitor);
    });

    const child = {
        type: "mdxJsxFlowElement" as const,
        name: "TabGroup",
        attributes: [toAttribute("tabs", tabs.map(collectProps)), ...node.attributes],
        children: [],
    };

    parent.children.splice(index, 1, child);
    return index + 1;
}

function transformTabItem(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
    visitor: Visitor,
): VisitorResult {
    const title = getTitle(node) ?? "Untitled";
    applyGeneratedId(node, title);
    visit(node, visitor);

    const tabItem = collectProps(node);
    const tabs = [tabItem];

    const child = {
        type: "mdxJsxFlowElement" as const,
        name: "TabGroup",
        attributes: [toAttribute("tabs", tabs), ...node.attributes],
        children: [],
    };

    parent.children.splice(index, 1, child);
    return index + 1;
}

function transformAccordionGroup(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
    visitor: Visitor,
): VisitorResult {
    const items = node.children.filter(isMdxJsxFlowElement).filter((child) => child.name === "Accordion");

    items.forEach((tab, index) => {
        const title = getTitle(tab) ?? `Untitled ${index + 1}`;
        applyGeneratedId(tab, title);
        visit(tab, visitor);
    });

    const child = {
        type: "mdxJsxFlowElement" as const,
        name: "AccordionGroup",
        attributes: [toAttribute("items", items.map(collectProps)), ...node.attributes],
        children: [],
    };
    parent.children.splice(index, 1, child);
    return index + 1;
}

// TODO: handle lone <Step> component
function transformSteps(
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
    visitor: Visitor,
): VisitorResult {
    const children: MdxJsxFlowElementHast[] = [];

    node.children.forEach((child) => {
        if (child.type === "mdxJsxFlowElement" && child.name === "Step") {
            const index = children.length + 1;
            child.attributes = child.attributes.filter((attr) =>
                isMdxJsxAttribute(attr) ? attr.name !== "index" : true,
            );
            child.attributes.push(toAttribute("index", index));

            const title = getTitle(child) ?? `Step ${index}`;
            applyGeneratedId(child, title);

            children.push(child);
        } else if (child.type === "element" && child.tagName === "h3") {
            const title = toString(child);

            // id may have been set by customHeadingHandler in remarkRehypeHandlers.ts
            const slug =
                (typeof child.properties["id"] === "string" ? child.properties["id"] : undefined) ??
                slugger.slug(title);
            children.push({
                type: "mdxJsxFlowElement",
                name: "Step",
                attributes: [
                    toAttribute("title", title),
                    toAttribute("id", slug),
                    toAttribute("index", children.length + 1),
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
                    attributes: [toAttribute("id", slug), toAttribute("index", index)],
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
    node: MdxJsxFlowElementHast,
    index: number,
    parent: Root | Element | MdxJsxFlowElementHast,
    visitor: Visitor,
): VisitorResult {
    const title = getTitle(node) ?? "Untitled";
    applyGeneratedId(node, title);
    visit(node, visitor);

    const item = collectProps(node);
    const items = [item];

    const child = {
        type: "mdxJsxFlowElement" as const,
        name: "AccordionGroup",
        attributes: [toAttribute("items", items)],
        children: [],
    };

    parent.children.splice(index, 1, child);
    return index + 1;
}

function collectProps(child: MdxJsxFlowElementHast) {
    const props: Record<string, ElementContent | string | MdxJsxAttributeValueExpression | null | undefined> = {};

    child.attributes.forEach((attr) => {
        if (attr.type === "mdxJsxAttribute") {
            props[attr.name] = attr.value;
        }

        // expression attributes are not supported
    });

    if (child.children.length > 0) {
        props.children = {
            type: "mdxJsxFlowElement",
            name: "Fragment",
            attributes: [],
            children: child.children.map((child) => (child.type === "text" ? h("p", {}, child.value) : child)),
        };
    }

    return props;
}

function getTitle(node: MdxJsxFlowElementHast): string | undefined {
    const title = node.attributes.filter(isMdxJsxAttribute).find((attr) => attr.name === "title")?.value;
    // TODO: handle expression attributes
    return typeof title === "string" ? title : undefined;
}

function applyGeneratedId(node: MdxJsxFlowElementHast, title: string): void {
    const id = node.attributes.filter(isMdxJsxAttribute).find((attr) => attr.name === "id");
    if (id == null) {
        const slug = slugger.slug(title);
        node.attributes.push(toAttribute("id", slug));
    }
}
