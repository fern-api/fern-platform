import { NextSeoProps } from "@fern-docs/next-seo";
import { atom } from "jotai";
import { DOCS_ATOM } from "./docs";
import { THEME_BG_COLOR } from "./theme";

export const NEXT_SEO_ATOM = atom<NextSeoProps>((get) => {
    const seo = get(DOCS_ATOM).seo;
    const themeBgColor = get(THEME_BG_COLOR);
    // TODO: fix shallow routed titles

    // const resolvedSlug = get(RESOLVED_PATH_SLUG_ATOM);
    // const resolvedTitle = get(RESOLVED_PATH_TITLE_ATOM);
    // const currentNode = get(CURRENT_NODE_ATOM);
    // let title = seo.title;
    // if (currentNode?.slug === resolvedSlug) {
    //     if (resolvedTitle && seo.title !== resolvedTitle) {
    //         title = resolvedTitle;
    //     }
    // } else if (currentNode?.title != null) {
    //     if (seo.title !== currentNode.title) {
    //         title = currentNode.title;
    //     }
    // }
    return {
        ...seo,
        themeColor: themeBgColor,
        viewport:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
        additionalMetaTags: [
            {
                name: "generator",
                content: "buildwithfern.com",
            },
            ...(seo.additionalMetaTags ?? []),
        ],
    };
});
NEXT_SEO_ATOM.debugLabel = "NEXT_SEO_ATOM";
