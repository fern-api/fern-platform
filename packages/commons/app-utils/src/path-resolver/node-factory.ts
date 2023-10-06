import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { ResolvedNode, ResolvedNodeTab, ResolvedNodeVersion } from "./types";

function createRoot(): ResolvedNode.Root {
    return {
        type: "root",
        slug: "",
        children: new Map(),
        childrenOrdering: [],
    };
}

function createVersion({ slug, version }: { slug: string; version: ResolvedNodeVersion }): ResolvedNode.Version {
    return {
        type: "version",
        slug,
        version,
        children: new Map(),
        childrenOrdering: [],
    };
}

function createTab({ slug, version }: { slug: string; version?: ResolvedNodeVersion | null }): ResolvedNode.Tab {
    return {
        type: "tab",
        slug,
        version: version ?? null,
        children: new Map(),
        childrenOrdering: [],
    };
}

function createDocsSection({
    slug,
    version,
    tab,
    section,
}: {
    slug: string;
    version?: ResolvedNodeVersion | null;
    tab?: ResolvedNodeTab | null;
    section: FernRegistryDocsRead.DocsSection;
}): ResolvedNode.DocsSection {
    return {
        type: "docs-section",
        slug,
        version: version ?? null,
        tab: tab ?? null,
        section,
        children: new Map(),
        childrenOrdering: [],
    };
}

function createApiSection({
    slug,
    version,
    tab,
    section,
}: {
    slug: string;
    version?: ResolvedNodeVersion | null;
    tab?: ResolvedNodeTab | null;
    section: FernRegistryDocsRead.ApiSection;
}): ResolvedNode.ApiSection {
    return {
        type: "api-section",
        slug,
        version: version ?? null,
        tab: tab ?? null,
        section,
        children: new Map(),
        childrenOrdering: [],
    };
}

function createApiSubpackage({
    slug,
    version,
    tab,
    section,
    subpackage,
}: {
    slug: string;
    version?: ResolvedNodeVersion | null;
    tab?: ResolvedNodeTab | null;
    section: FernRegistryDocsRead.ApiSection;
    subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
}): ResolvedNode.ApiSubpackage {
    return {
        type: "api-subpackage",
        slug,
        version: version ?? null,
        tab: tab ?? null,
        section,
        subpackage,
        children: new Map(),
        childrenOrdering: [],
    };
}

function createPage({
    slug,
    version,
    tab,
    page,
}: {
    slug: string;
    version?: ResolvedNodeVersion | null;
    tab?: ResolvedNodeTab | null;
    page: FernRegistryDocsRead.PageMetadata;
}): ResolvedNode.Page {
    return {
        type: "page",
        slug,
        version: version ?? null,
        tab: tab ?? null,
        page,
    };
}

export const NODE_FACTORY = {
    root: {
        create: createRoot,
    },
    version: {
        create: createVersion,
    },
    tab: {
        create: createTab,
    },
    docsSection: {
        create: createDocsSection,
    },
    apiSection: {
        create: createApiSection,
    },
    apiSubpackage: {
        create: createApiSubpackage,
    },
    page: {
        create: createPage,
    },
};
