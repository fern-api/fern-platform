import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import type { ElementContent, Root } from "hast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import {
    toCustomLayoutHastNode,
    toGuideLayoutHastNode,
    toOverviewLayoutHastNode,
    toPageLayoutHastNode,
    toReferenceLayoutHastNode,
} from "../components/layout";
import { makeToc } from "./makeToc";
import { wrapChildren } from "./to-estree";

interface Options {
    matter: Partial<FernDocs.Frontmatter>;
}

export function rehypeFernLayout(opt: Options): (tree: Root, vfile: VFile) => void {
    return async (tree, vfile) => {
        const matter = mergeMatter(vfile.data.matter as FernDocs.Frontmatter | undefined, opt.matter);
        opt.matter = matter;
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
        const tableOfContents = (matter["hide-toc"] ?? false) ? undefined : makeToc(tree, matter["force-toc"] ?? false);
        const aside = wrapChildren(asideContents);
        switch (matter.layout) {
            case "custom":
                return toCustomLayoutHastNode({ children });
            case "overview":
                return toOverviewLayoutHastNode({
                    breadcrumb: matter.breadcrumb ?? EMPTY_ARRAY,
                    title: matter.title ?? "",
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: matter["hide-feedback"] ?? false,
                });
            case "page":
                return toPageLayoutHastNode({
                    breadcrumb: matter.breadcrumb ?? EMPTY_ARRAY,
                    title: matter.title ?? "",
                    subtitle,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: matter["hide-feedback"] ?? false,
                    hideNavLinks: matter["hide-nav-links"] ?? false,
                });
            case "reference":
                return toReferenceLayoutHastNode({
                    breadcrumb: matter.breadcrumb ?? EMPTY_ARRAY,
                    title: matter.title ?? "",
                    subtitle,
                    children,
                    aside,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: matter["hide-feedback"] ?? false,
                });
            default:
                return toGuideLayoutHastNode({
                    breadcrumb: matter.breadcrumb ?? EMPTY_ARRAY,
                    title: matter.title ?? "",
                    subtitle,
                    tableOfContents,
                    children,
                    editThisPageUrl: matter["edit-this-page-url"],
                    hideFeedback: matter["hide-feedback"] ?? false,
                    hideNavLinks: matter["hide-nav-links"] ?? false,
                });
        }
    };
}

export function mergeMatter(
    matter: Partial<FernDocs.Frontmatter> = {},
    defaults: Partial<FernDocs.Frontmatter>,
): Partial<FernDocs.Frontmatter> {
    if (matter == null) {
        return {
            ...defaults,
            layout: defaults.layout ?? "guide",
        };
    }

    return {
        ...defaults,
        ...matter,
        title: matter.title ?? defaults.title,
        subtitle: matter.subtitle ?? matter.excerpt ?? defaults.subtitle,
        "edit-this-page-url": matter["edit-this-page-url"] ?? defaults["edit-this-page-url"],
        layout: defaults.layout ?? matter.layout ?? "guide",
        "hide-nav-links": defaults["hide-nav-links"] ?? matter["hide-nav-links"],
        breadcrumb: matter.breadcrumb ?? defaults.breadcrumb,
        "force-toc": matter["force-toc"] ?? defaults["force-toc"],
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
