import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import {
    DefinitionObjectFactory,
    DocsDefinitionSummary,
    NodeFactory,
    PathResolver,
    type NavigatableDocsNode,
    type NodeNeighbors,
} from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";
import { ResolvedPath } from "../ResolvedPath";

const emptyDefinition = DefinitionObjectFactory.createDocsDefinition();
const emptyDefinitionSummary: DocsDefinitionSummary = {
    apis: emptyDefinition.apis,
    docsConfig: emptyDefinition.config,
};

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
            root: NodeFactory.createRoot(emptyDefinitionSummary),
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
    resolver: new PathResolver({ definition: emptyDefinitionSummary }),
    registerScrolledToPathListener: () => noop,
    resolvedPath: {
        type: "custom-markdown-page",
        fullSlug: "",
        page: {
            id: FernRegistryDocsRead.PageId(""),
            title: "",
            urlSlug: "",
        },
        serializedMdxContent: { compiledSource: "", frontmatter: {}, scope: {} },
    },
});

export interface NavigationContextValue {
    hasInitialized: boolean;
    justNavigated: boolean;
    activeNavigatable: NavigatableDocsNode;
    activeNavigatableNeighbors: NodeNeighbors;
    navigateToPath: (slugWithoutVersion: string) => void;
    userIsScrolling: () => boolean;
    onScrollToPath: (slug: string) => void;
    observeDocContent: (element: HTMLDivElement) => void;
    resolver: PathResolver;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    resolvedPath: ResolvedPath;
}
