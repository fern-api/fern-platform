import { VersionInfo } from "@fern-api/fdr-sdk";
import { noop } from "@fern-ui/core-utils";
import React from "react";
import { SidebarNode } from "../sidebar/types";
import { type ResolvedPath } from "../util/ResolvedPath";

export const NavigationContext = React.createContext<NavigationContextValue>({
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
    activeVersion: VersionInfo | undefined;
    selectedSlug: string;
    activeNavigatable: SidebarNode.Page | undefined;
    onScrollToPath: (slug: string) => void;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    resolvedPath: ResolvedPath; // the initial path that was hard-navigated
    hydrated: boolean;
}
