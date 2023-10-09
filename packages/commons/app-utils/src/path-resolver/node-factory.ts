import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { DocsNode, DocsNodeTab, DocsNodeVersion } from "./types";

function createRoot(): DocsNode.Root {
    return {
        type: "root",
        slug: "",
        children: new Map(),
        childrenOrdering: [],
        info: { type: "unversioned" },
    };
}

function createVersion({ slug, version }: { slug: string; version: DocsNodeVersion }): DocsNode.Version {
    return {
        type: "version",
        slug,
        version,
        children: new Map(),
        childrenOrdering: [],
    };
}

function createTab({ slug, version }: { slug: string; version?: DocsNodeVersion | null }): DocsNode.Tab {
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
    version?: DocsNodeVersion | null;
    tab?: DocsNodeTab | null;
    section: FernRegistryDocsRead.DocsSection;
}): DocsNode.DocsSection {
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
    version?: DocsNodeVersion | null;
    tab?: DocsNodeTab | null;
    section: FernRegistryDocsRead.ApiSection;
}): DocsNode.ApiSection {
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
    version?: DocsNodeVersion | null;
    tab?: DocsNodeTab | null;
    section: FernRegistryDocsRead.ApiSection;
    subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
}): DocsNode.ApiSubpackage {
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
    leadingSlug,
    version,
    tab,
    endpoint,
}: {
    slug: string;
    leadingSlug: string;
    version?: DocsNodeVersion | null;
    tab?: DocsNodeTab | null;
    endpoint: FernRegistryApiRead.EndpointDefinition;
}): DocsNode.Endpoint {
    return {
        type: "endpoint",
        slug,
        leadingSlug,
        version: version ?? null,
        tab: tab ?? null,
        endpoint,
    };
}

function createWebhook({
    slug,
    leadingSlug,
    version,
    tab,
    webhook,
}: {
    slug: string;
    leadingSlug: string;
    version?: DocsNodeVersion | null;
    tab?: DocsNodeTab | null;
    webhook: FernRegistryApiRead.WebhookDefinition;
}): DocsNode.Webhook {
    return {
        type: "webhook",
        slug,
        leadingSlug,
        version: version ?? null,
        tab: tab ?? null,
        webhook,
    };
}

function createPage({
    slug,
    leadingSlug,
    version,
    tab,
    page,
}: {
    slug: string;
    leadingSlug: string;
    version?: DocsNodeVersion | null;
    tab?: DocsNodeTab | null;
    page: FernRegistryDocsRead.PageMetadata;
}): DocsNode.Page {
    return {
        type: "page",
        slug,
        leadingSlug,
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
    webhook: {
        create: createWebhook,
    },
    page: {
        create: createPage,
    },
};
