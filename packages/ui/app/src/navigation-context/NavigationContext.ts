import {
    NodeFactory,
    PathResolver,
    type DocsDefinitionSummary,
    type NavigatableDocsNode,
    type NodeNeighbors,
} from "@fern-api/fdr-sdk";
import { DefinitionObjectFactory, type ResolvedPath } from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";

const EMPTY_DEFINITION = DefinitionObjectFactory.createDocsDefinition();
const EMPTY_DEFINITION_SUMMARY: DocsDefinitionSummary = {
    apis: EMPTY_DEFINITION.apis,
    docsConfig: EMPTY_DEFINITION.config,
};

export const NavigationContext = React.createContext<NavigationContextValue>({
    basePath: undefined,
    justNavigated: false,
    activeNavigatable: NodeFactory.createPage({
        slug: "",
        leadingSlug: "",
        page: {
            id: "",
            title: "",
            urlSlug: "",
        },
        section: null,
        context: {
            type: "unversioned-untabbed",
            root: NodeFactory.createRoot(EMPTY_DEFINITION_SUMMARY),
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
    resolver: new PathResolver({ definition: EMPTY_DEFINITION_SUMMARY }),
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
    resolver: PathResolver;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    resolvedPath: ResolvedPath; // the initial path that was hard-navigated
    hydrated: boolean;
}
