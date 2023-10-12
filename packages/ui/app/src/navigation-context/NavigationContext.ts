import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import {
    DefinitionObjectFactory,
    NodeFactory,
    PathResolver,
    SerializedMdxContent,
    type NavigatableDocsNode,
    type NodeNeighbors,
} from "@fern-ui/app-utils";
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
    activeNavigatableNeighbors: {
        previous: null,
        next: null,
    },
    navigateToPath: noop,
    userIsScrolling: () => false,
    onScrollToPath: noop,
    observeDocContent: noop,
    resolver: new PathResolver({ docsDefinition: emptyDefinition }),
    registerScrolledToPathListener: () => noop,
    serializedMdxContent: undefined,
});

export interface NavigationContextValue {
    hasInitialized: boolean;
    justNavigated: boolean;
    activeNavigatable: NavigatableDocsNode;
    activeNavigatableNeighbors: NodeNeighbors;
    navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts) => void;
    userIsScrolling: () => boolean;
    onScrollToPath: (slug: string) => void;
    observeDocContent: (element: HTMLDivElement) => void;
    resolver: PathResolver;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    // This may need to be placed elsewhere
    serializedMdxContent: SerializedMdxContent | undefined;
}
