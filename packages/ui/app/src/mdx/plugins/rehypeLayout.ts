import type { ElementContent, Root } from "hast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { toCustomLayoutHastNode } from "../../layout/CustomLayout";
import { toGuideLayoutHastNode } from "../../layout/GuideLayout";
import { toOverviewLayoutHastNode } from "../../layout/OverviewLayout";
import { toPageLayoutHastNode } from "../../layout/PageLayout";
import { toReferenceLayoutHastNode } from "../../layout/ReferenceLayout";
import { FernDocsFrontmatter } from "../mdx";
import { makeToc } from "./makeToc";
import { wrapChildren } from "./to-estree";

export interface PageHeaderProps {
    breadcrumbs: string[];

    // the following are defaults, can be overridden by frontmatter
    title: string;
    subtitle?: string;
    editThisPageUrl?: string;

    // the following are overrides that "forces" a config regardless of frontmatter
    layout?: FernDocsFrontmatter["layout"]; // sometimes we need to force a layout, e.g. reference layout for endpoints
    hideNavLinks?: boolean;

    // feature flags
    isTocDefaultEnabled: boolean;
}

export function rehypeFernLayout(props?: PageHeaderProps): (tree: Root, vfile: VFile) => void {
    return async (tree, vfile) => {
        const matter = vfile.data.matter as FernDocsFrontmatter | undefined;
        props = mergePropsWithMatter(props, matter);
        vfile.data.matter = props;
        let layout = props?.layout ?? "guide";

        const asideContents = collectAsideContent(tree);

        // If there is an aside, enforce reference layout
        if (asideContents.length > 0) {
            layout = "reference";
        }

        props.layout = layout;

        const children = tree.children as ElementContent[];
        const subtitle = props.subtitle != null ? wrapChildren(parseMarkdown(props.subtitle)) : undefined;
        const tableOfContents = makeToc(tree, props.isTocDefaultEnabled);
        const aside = wrapChildren(asideContents);
        switch (layout) {
            case "custom":
                return toCustomLayoutHastNode({ children });
            case "overview":
                return toOverviewLayoutHastNode({
                    breadcrumbs: props.breadcrumbs,
                    title: props.title,
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: props.editThisPageUrl,
                    hideFeedback: false,
                });
            case "page":
                return toPageLayoutHastNode({
                    breadcrumbs: props.breadcrumbs,
                    title: props.title,
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: props.editThisPageUrl,
                    hideFeedback: false,
                    hideNavLinks: false,
                });
            case "reference":
                return toReferenceLayoutHastNode({
                    breadcrumbs: props.breadcrumbs,
                    title: props.title,
                    subtitle,
                    children,
                    aside,
                    editThisPageUrl: props.editThisPageUrl,
                    hideFeedback: false,
                });
            default:
                return toGuideLayoutHastNode({
                    breadcrumbs: props.breadcrumbs,
                    title: props.title,
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: props.editThisPageUrl,
                    hideFeedback: false,
                    hideNavLinks: false,
                });
        }
    };
}

function mergePropsWithMatter(
    props: PageHeaderProps | undefined,
    matter: FernDocsFrontmatter | undefined,
): PageHeaderProps {
    if (matter == null || props == null) {
        return {
            breadcrumbs: [],
            title: "",
            isTocDefaultEnabled: true,
        };
    }

    return {
        ...props,
        title: matter.title ?? props.title,
        subtitle: matter.subtitle ?? matter.excerpt ?? props.subtitle,
        editThisPageUrl: matter["edit-this-page-url"] ?? matter.editThisPageUrl ?? props.editThisPageUrl,
        layout: props.layout ?? matter.layout,
        hideNavLinks: props.hideNavLinks ?? matter["hide-nav-links"],
    };
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

function collectAsideContent(tree: Root): ElementContent[] {
    const elements: ElementContent[] = [];

    visit(tree, (node, index, parent) => {
        if (node.type === "mdxJsxFlowElement" && node.name === "Aside") {
            elements.push(...node.children);

            // Remove the aside node from the parent
            if (index != null) {
                parent?.children.splice(index, 1);
            }

            return "skip";
        }
        return true;
    });

    return elements;
}
