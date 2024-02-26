import { type NavigatableDocsNode } from "@fern-api/fdr-sdk";
import { noop } from "@fern-ui/core-utils";
import React from "react";
import { type ResolvedPath } from "../util/ResolvedPath";

export const NavigationContext = React.createContext<NavigationContextValue>({
    basePath: undefined,
    justNavigated: false,
    activeNavigatable: undefined,
    userIsScrolling: () => false,
    onScrollToPath: noop,
    observeDocContent: noop,
    registerScrolledToPathListener: () => noop,
    resolvedPath: {
        type: "custom-markdown-page",
        fullSlug: "",
        page: {
            id: "",
            title: "",
            urlSlug: "",
        },
        sectionTitle: "",
        serializedMdxContent: { compiledSource: "", frontmatter: {}, scope: {} },
        editThisPageUrl: null,
        neighbors: {
            prev: null,
            next: null,
        },
    },
    hydrated: false,
});

export interface NavigationContextValue {
    basePath: string | undefined;
    justNavigated: boolean;
    activeNavigatable: NavigatableDocsNode | undefined;
    userIsScrolling: () => boolean;
    onScrollToPath: (slug: string) => void;
    observeDocContent: (element: HTMLDivElement) => void;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    resolvedPath: ResolvedPath; // the initial path that was hard-navigated
    hydrated: boolean;
}
