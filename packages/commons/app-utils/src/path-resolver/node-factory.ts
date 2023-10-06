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

function createTab({ slug, version }: { slug: string; version?: ResolvedNodeVersion }): ResolvedNode.Tab {
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
    version?: ResolvedNodeVersion;
    tab?: ResolvedNodeTab;
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
};
