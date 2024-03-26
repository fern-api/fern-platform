import { noop } from "@fern-ui/core-utils";
import { SidebarNode, SidebarVersionInfo } from "@fern-ui/fdr-utils";
import React from "react";
import { type ResolvedPath } from "../../util/ResolvedPath";

export const NavigationContext = React.createContext<NavigationContextValue>({
    domain: "",
    basePath: undefined,
    activeVersion: undefined,
    selectedSlug: "",
    activeNavigatable: undefined,
    onScrollToPath: noop,
    registerScrolledToPathListener: () => noop,
    resolvedPath: {
        type: "custom-markdown-page",
        fullSlug: "",
        title: "",
        sectionTitleBreadcrumbs: [],
        serializedMdxContent: "",
        editThisPageUrl: null,
        neighbors: {
            prev: null,
            next: null,
        },
        apis: {},
    },
});

export interface NavigationContextValue {
    domain: string;
    basePath: string | undefined;
    activeVersion: SidebarVersionInfo | undefined;
    selectedSlug: string;
    activeNavigatable: SidebarNode.Page | undefined;
    onScrollToPath: (slug: string) => void;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    resolvedPath: ResolvedPath; // the initial path that was hard-navigated
}
