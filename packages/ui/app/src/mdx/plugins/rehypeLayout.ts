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
import { FernDocsFrontmatter } from "../frontmatter";
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

export function rehypeFernLayout(matter: FernDocsFrontmatter): (tree: Root, vfile: VFile) => void {
    return async (tree, vfile) => {
        // let matter = vfile.data.matter as FernDocsFrontmatter | undefined;
        // matter = mergePropsWithMatter(props, matter);
        vfile.data.matter = matter;

        const asideContents = collectAsideContent(tree);

        // If there is an aside, enforce reference layout
        if (asideContents.length > 0) {
            matter.layout = "reference";
        }

        if (matter.layout === "custom") {
            matter["no-image-zoom"] = true;
        }

        const children = tree.children as ElementContent[];
        const subtitle = matter.subtitle != null ? wrapChildren(parseMarkdown(matter.subtitle)) : undefined;
        const tableOfContents = makeToc(tree, matter["force-toc"]);
        const aside = wrapChildren(asideContents);
        switch (matter.layout) {
            case "custom":
                return toCustomLayoutHastNode({ children });
            case "overview":
                return toOverviewLayoutHastNode({
                    breadcrumbs: matter.breadcrumbs ?? [],
                    title: matter.title ?? "",
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: false,
                });
            case "page":
                return toPageLayoutHastNode({
                    breadcrumbs: matter.breadcrumbs ?? [],
                    title: matter.title ?? "",
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: false,
                    hideNavLinks: false,
                });
            case "reference":
                return toReferenceLayoutHastNode({
                    breadcrumbs: matter.breadcrumbs ?? [],
                    title: matter.title ?? "",
                    subtitle,
                    children,
                    aside,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: false,
                });
            default:
                return toGuideLayoutHastNode({
                    breadcrumbs: matter.breadcrumbs ?? [],
                    title: matter.title ?? "",
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: false,
                    hideNavLinks: false,
                });
        }
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
