import { NextSeoProps } from "@fern-ui/next-seo";
import { atom } from "jotai";
import { CURRENT_NODE_ATOM, RESOLVED_PATH_ATOM } from "./navigation";
import { THEME_BG_COLOR } from "./theme";

export const SETTABLE_NEXT_SEO_ATOM = atom<NextSeoProps>({});

export const NEXT_SEO_ATOM = atom<NextSeoProps>((get) => {
    const seo = get(SETTABLE_NEXT_SEO_ATOM);
    const themeBgColor = get(THEME_BG_COLOR);
    const resolvedPath = get(RESOLVED_PATH_ATOM);
    const currentNode = get(CURRENT_NODE_ATOM);
    let title = seo.title;
    if (currentNode?.slug === resolvedPath.slug) {
        if (seo.title !== resolvedPath.title) {
            title = resolvedPath.title;
        }
    } else if (currentNode?.title != null) {
        if (seo.title !== currentNode.title) {
            title = currentNode.title;
        }
    }
    return {
        ...seo,
        title,
        themeColor: themeBgColor,
        viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    };
});
