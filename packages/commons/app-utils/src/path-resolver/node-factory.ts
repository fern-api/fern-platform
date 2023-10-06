import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

import { ResolvedNode, ResolvedNodeTab, ResolvedNodeVersion } from "./types";

type Func<T extends unknown[], R> = (...args: T) => R;

function createVersion({ slug, version }: { slug: string; version: ResolvedNodeVersion }): ResolvedNode.Version {
    return {
        type: "version",
        slug,
        version,
        children: new Map(),
    };
}

function createTab({ slug, version }: { slug: string; version?: ResolvedNodeVersion }): ResolvedNode.Tab {
    return {
        type: "tab",
        slug,
        version: version ?? null,
        children: new Map(),
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
    };
}

export const NODE_FACTORY = {
    version: {
        create: createVersion,
    },
    tab: {
        create: createTab,
    },
    docsSection: {
        create: createDocsSection,
    },
} satisfies Record<string, { create: Func<never, ResolvedNode> }>;
