import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { DefinitionObjectFactory, type NavigatableDocsNode, PathResolver, NodeFactory } from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";

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
            version: null,
            tab: null,
        },
    }),
    hasInitialized: false,
    justNavigated: false,
    navigateToPath: noop,
    getFullSlug: () => "",
    userIsScrolling: () => false,
    onScrollToPath: noop,
    observeDocContent: noop,
    resolver: new PathResolver({ docsDefinition: emptyDefinition }),
});

export interface NavigationContextValue {
    activeNavigatable: NavigatableDocsNode;
    hasInitialized: boolean;
    justNavigated: boolean;
    navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts) => void;
    /** Returns the version-prefixed slug. */
    getFullSlug: (slug: string, opts?: { tabSlug?: string }) => string;
    userIsScrolling: () => boolean;
    onScrollToPath: (slug: string) => void;
    observeDocContent: (element: HTMLDivElement) => void;
    resolver: PathResolver;
}
