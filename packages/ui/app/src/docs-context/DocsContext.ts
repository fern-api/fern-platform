import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { type ResolvedUrlPath } from "@fern-ui/app-utils";
import React from "react";

export const DocsContext = React.createContext<() => DocsContextValue>(() => {
    throw new Error("DocsContextValueProvider is not present in this tree.");
});

export interface DocsInfoVersion {
    versionSlug: string;
    availability?: FernRegistryDocsRead.VersionAvailability;
}

interface DocsInfoVersioned {
    type: "versioned";
    versions: DocsInfoVersion[];
    activeVersionSlug: string;
    isDefaultVersion: boolean;
    activeNavigationConfig: FernRegistryDocsRead.UnversionedNavigationConfig;
    rootSlug: string;
}

interface DocsInfoUnversioned {
    type: "unversioned";
    activeNavigationConfig: FernRegistryDocsRead.UnversionedNavigationConfig;
    rootSlug: string;
}

export type DocsInfo = DocsInfoVersioned | DocsInfoUnversioned;

export interface NavigateToPathOpts {
    omitVersionPrefix: boolean;
    tabSlug?: string;
}

export interface DocsContextValue {
    resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    resolvePage: (pageId: FernRegistryDocsRead.PageId) => FernRegistryDocsRead.PageContent;
    resolveFile: (fileId: FernRegistryDocsRead.FileId) => FernRegistryDocsRead.Url;

    navigateToPath: (slugWithoutVersion: string, opts?: NavigateToPathOpts) => void;
    registerNavigateToPathListener: (slugWithVersion: string, listener: () => void) => () => void;

    onScrollToPath: (slug: string) => void;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;

    docsDefinition: FernRegistryDocsRead.DocsDefinition;
    docsInfo: DocsInfo;
    setActiveVersionSlug: (versionSlug: string) => void;
    activeTab: FernRegistryDocsRead.NavigationTab | undefined;
    activeTabIndex: number | null;
    setActiveTabIndex: (index: number) => void;

    /** Returns the version-prefixed slug. */
    getFullSlug: (slug: string, opts?: { tabSlug?: string }) => string;

    // controlled
    selectedSlug: string | undefined;

    // from URL
    resolvedPathFromUrl: ResolvedUrlPath;

    nextPath: ResolvedUrlPath | undefined;
    previousPath: ResolvedUrlPath | undefined;
}

export interface Anchor {
    pathname: string;
    hash: string;
}
