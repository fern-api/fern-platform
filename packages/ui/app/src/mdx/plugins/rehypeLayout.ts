import { clsx as cn } from "clsx";
import type { Element, ElementContent, Root } from "hast";
import { toString } from "hast-util-to-string";
import { h } from "hastscript";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { TableOfContentsItem } from "../../custom-docs-page/TableOfContents";
import { FernDocsFrontmatter } from "../mdx";
import { toAttribute } from "./utils";

interface FoundHeading {
    depth: number;
    title: string;
    id: string;
}

export interface PageHeaderProps {
    breadcrumbs: string[];
    title: string;
    excerpt?: string;
}

export function rehypeFernLayout(props?: PageHeaderProps): (tree: Root, vfile: VFile) => void {
    return async (tree, vfile) => {
        const matter = vfile.data.matter as FernDocsFrontmatter | undefined;
        props = mergePropsWithMatter(props, matter);
        const headings: FoundHeading[] = [];

        let header: Element | null = null;
        if (props != null) {
            const heading = h(
                "div",
                {
                    type: "mdxJsxFlowElement",
                    name: "Breadcrumbs",
                    attributes: [toAttribute("breadcrumbs", props.breadcrumbs)],
                    children: [],
                },
                h("div", h("h1", { class: "my-0 inline-block leading-tight" }, props.title)),
            );
            const excerpt =
                props.excerpt != null
                    ? h(
                          "div",
                          { class: "prose dark:prose-invert prose-p:t-muted prose-lg mt-2 leading-7" },
                          ...parseMarkdown(props.excerpt),
                      )
                    : null;
            header = h("header", { class: "mb-8" }, heading, excerpt);
        }

        visit(tree, (node) => {
            if (node.type === "element" && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
                const id = node.properties.id;
                if (id == null || typeof id !== "string") {
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const depth = parseInt(node.tagName[1]!);
                const title = toString(node);

                headings.push({ depth, id, title });
            }
        });

        const minDepth = Math.min(...headings.map((heading) => heading.depth));

        const tableOfContents: ElementContent = {
            type: "mdxJsxFlowElement",
            name: "TableOfContents",
            attributes: [toAttribute("tableOfContents", makeTree(headings, minDepth))],
            children: [],
        };

        const layout = matter?.layout ?? "guide";
        const article = h(
            "article",
            {
                class: cn(
                    "prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 mx-auto w-full break-words lg:ml-0 xl:mx-auto pb-20",
                    {
                        "max-w-content-width": layout === "guide",
                        "max-w-content-wide-width": layout === "overview",
                    },
                ),
            },
            header,
            ...tree.children,
        );

        return h(
            "div",
            { class: "relative flex justify-between px-4 md:px-6 lg:pl-8 lg:pr-16 xl:pr-0" },
            h("div", { class: "z-10 w-full min-w-0 pt-8 lg:pr-8" }, article),
            h(
                "aside",
                { class: "top-header-height h-vh-minus-header w-sidebar-width sticky hidden shrink-0 xl:block" },
                matter?.hideToc !== true
                    ? {
                          type: "mdxJsxFlowElement",
                          name: "ScrollArea",
                          attributes: [toAttribute("className", "px-4 pb-12 pt-8 lg:pr-8")],
                          children: [tableOfContents],
                      }
                    : undefined,
            ),
        );
    };
}

function mergePropsWithMatter(
    props: PageHeaderProps | undefined,
    matter: FernDocsFrontmatter | undefined,
): PageHeaderProps | undefined {
    if (matter == null || props == null) {
        return props;
    }

    return {
        ...props,
        title: matter.title ?? props.title,
        excerpt: matter.excerpt ?? props.excerpt,
    };
}

function makeTree(headings: FoundHeading[], depth: number = 1): TableOfContentsItem[] {
    const tree: TableOfContentsItem[] = [];

    while (headings.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const firstToken = headings[0]!;

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

function parseMarkdown(markdown: string): ElementContent[] {
    const processed = toHast(fromMarkdown(markdown));
    const elements: ElementContent[] = [];
    visit(processed, (node) => {
        if (node.type === "element" || node.type === "text") {
            elements.push(node);
            return "skip";
        }
        return true;
    });
    return elements;
}
