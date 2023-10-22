import {
    NodeFactory,
    PathResolver,
    type DocsDefinitionSummary,
    type NavigatableDocsNode,
    type NodeNeighbors,
} from "@fern-api/fdr-sdk";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { DefinitionObjectFactory } from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";
import { ResolvedPath } from "../ResolvedPath";

const EMPTY_DEFINITION = DefinitionObjectFactory.createDocsDefinition();
const EMPTY_DEFINITION_SUMMARY: DocsDefinitionSummary = {
    apis: EMPTY_DEFINITION.apis,
    docsConfig: EMPTY_DEFINITION.config,
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
            id: FernRegistryDocsRead.PageId(""),
            title: "",
            urlSlug: "",
        },
        sectionTitle: "",
        serializedMdxContent: { compiledSource: "", frontmatter: {}, scope: {} },
    },
    basePath: undefined,
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
    basePath: string | undefined;
}
