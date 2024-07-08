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

export function rehypeFernLayout(matter: FernDocsFrontmatter): (tree: Root, vfile: VFile) => void {
    return async (tree, vfile) => {
        matter = mergeMatter(vfile.data.matter as FernDocsFrontmatter | undefined, matter);
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
        const tableOfContents = matter["hide-toc"] ? undefined : makeToc(tree, matter["force-toc"]);
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
                    hideFeedback: matter["hide-feedback"],
                });
            case "page":
                return toPageLayoutHastNode({
                    breadcrumbs: matter.breadcrumbs ?? [],
                    title: matter.title ?? "",
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: matter["hide-feedback"],
                    hideNavLinks: matter["hide-nav-links"],
                });
            case "reference":
                return toReferenceLayoutHastNode({
                    breadcrumbs: matter.breadcrumbs ?? [],
                    title: matter.title ?? "",
                    subtitle,
                    children,
                    aside,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: matter["hide-feedback"],
                });
            default:
                return toGuideLayoutHastNode({
                    breadcrumbs: matter.breadcrumbs ?? [],
                    title: matter.title ?? "",
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: matter["hide-feedback"],
                    hideNavLinks: matter["hide-nav-links"],
                });
        }
    };
}

function mergeMatter(
    props: FernDocsFrontmatter | undefined,
    matter: FernDocsFrontmatter | undefined,
): FernDocsFrontmatter {
    if (matter == null || props == null) {
        return {
            layout: "guide",
        };
    }

    return {
        ...matter,
        ...props,
        title: matter.title ?? props.title,
        subtitle: matter.subtitle ?? matter.excerpt ?? props.subtitle,
        "edit-this-page-url": matter["edit-this-page-url"] ?? matter.editThisPageUrl ?? props.editThisPageUrl,
        layout: props.layout ?? matter.layout ?? "guide",
        "hide-nav-links": props["hide-nav-links"] ?? matter["hide-nav-links"],
        breadcrumbs: matter.breadcrumbs ?? props.breadcrumbs,
        "force-toc": matter["force-toc"] ?? props["force-toc"],
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
