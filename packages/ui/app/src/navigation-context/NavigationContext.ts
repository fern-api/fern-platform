import { type NavigatableDocsNode, type NodeNeighbors } from "@fern-api/fdr-sdk";
import { type ResolvedPath } from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";

export const NavigationContext = React.createContext<NavigationContextValue>({
    basePath: undefined,
    justNavigated: false,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    activeNavigatable: undefined!,
    activeNavigatableNeighbors: {
        previous: null,
        next: null,
    },
    navigateToPath: noop,
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
    },
    hydrated: false,
});

export interface NavigationContextValue {
    basePath: string | undefined;
    justNavigated: boolean;
    activeNavigatable: NavigatableDocsNode;
    activeNavigatableNeighbors: NodeNeighbors;
    navigateToPath: (slugWithoutVersion: string) => void;
    userIsScrolling: () => boolean;
    onScrollToPath: (slug: string) => void;
    observeDocContent: (element: HTMLDivElement) => void;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    resolvedPath: ResolvedPath; // the initial path that was hard-navigated
    hydrated: boolean;
}
