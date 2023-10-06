import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { DefinitionNode, DefinitionNodeTab, DefinitionNodeVersion } from "./types";

function createRoot(): DefinitionNode.Root {
    return {
        type: "root",
        slug: "",
        children: new Map(),
        childrenOrdering: [],
    };
}

function createVersion({ slug, version }: { slug: string; version: DefinitionNodeVersion }): DefinitionNode.Version {
    return {
        type: "version",
        slug,
        version,
        children: new Map(),
        childrenOrdering: [],
    };
}

function createTab({ slug, version }: { slug: string; version?: DefinitionNodeVersion | null }): DefinitionNode.Tab {
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
    version?: DefinitionNodeVersion | null;
    tab?: DefinitionNodeTab | null;
    section: FernRegistryDocsRead.DocsSection;
}): DefinitionNode.DocsSection {
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
    version?: DefinitionNodeVersion | null;
    tab?: DefinitionNodeTab | null;
    section: FernRegistryDocsRead.ApiSection;
}): DefinitionNode.ApiSection {
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
    version?: DefinitionNodeVersion | null;
    tab?: DefinitionNodeTab | null;
    section: FernRegistryDocsRead.ApiSection;
    subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
}): DefinitionNode.ApiSubpackage {
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

function createEndpoint({
    slug,
    version,
    tab,
    endpoint,
}: {
    slug: string;
    version?: DefinitionNodeVersion | null;
    tab?: DefinitionNodeTab | null;
    endpoint: FernRegistryApiRead.EndpointDefinition;
}): DefinitionNode.Endpoint {
    return {
        type: "endpoint",
        slug,
        version: version ?? null,
        tab: tab ?? null,
        endpoint,
    };
}

function createPage({
    slug,
    version,
    tab,
    page,
}: {
    slug: string;
    version?: DefinitionNodeVersion | null;
    tab?: DefinitionNodeTab | null;
    page: FernRegistryDocsRead.PageMetadata;
}): DefinitionNode.Page {
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
    endpoint: {
        create: createEndpoint,
    },
    page: {
        create: createPage,
    },
};
