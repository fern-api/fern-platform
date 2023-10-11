import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { DefinitionObjectFactory, type NavigatableDocsNode, PathResolver, NodeFactory } from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";
import { ResolvedPath } from "../ResolvedPath";

export interface GetFullSlugOpts {
    /**
     * Version slug is included by default.
     */
    omitVersionSlug?: boolean;
    /**
     * Defaults to the currently active tab slug.
     */
    tabSlug?: string;
    /**
     * Tab slug is included by default.
     */
    omitTabSlug?: boolean;
}

export interface NavigateToPathOpts extends GetFullSlugOpts {}

const emptyDefinition = DefinitionObjectFactory.createDocsDefinition();

export const NavigationContext = React.createContext<NavigationContextValue>({
    resolvedPath: { type: "other", fullSlug: "" },
    hasInitialized: false,
    justNavigated: false,
    activeNavigatable: NodeFactory.createPage({
        slug: "",
        leadingSlug: "",
        page: {
            id: FernRegistryDocsRead.PageId(""),
            title: "",
            urlSlug: "",
        },
        context: {
            type: "unversioned-untabbed",
            root: NodeFactory.createRoot(emptyDefinition),
            navigationConfig: { items: [] },
            version: null,
            tab: null,
        },
    }),
    navigateToPath: noop,
    getFullSlug: () => "",
    userIsScrolling: () => false,
    onScrollToPath: noop,
    observeDocContent: noop,
    resolver: new PathResolver({ docsDefinition: emptyDefinition }),
    registerScrolledToPathListener: () => noop,
});

export interface NavigationContextValue {
    resolvedPath: ResolvedPath;
    hasInitialized: boolean;
    justNavigated: boolean;
    activeNavigatable: NavigatableDocsNode;
    navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts) => void;
    /** Returns the version-prefixed slug. */
    getFullSlug: (slug: string, opts?: { tabSlug?: string }) => string;
    userIsScrolling: () => boolean;
    onScrollToPath: (slug: string) => void;
    observeDocContent: (element: HTMLDivElement) => void;
    resolver: PathResolver;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
}
