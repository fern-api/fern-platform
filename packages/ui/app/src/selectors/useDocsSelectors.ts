import { type DefinitionInfo, type DocsNode } from "@fern-api/fdr-sdk";
import type * as FernRegistryDocsRead from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";
import { getFullSlugForNavigatable, joinUrlSlugs } from "@fern-ui/app-utils";
import { useCallback, useMemo } from "react";
import { useNavigationContext } from "../navigation-context/useNavigationContext";

type WithVersionSlugOpts = {
    omitDefault?: boolean;
};

interface DocsSelectors {
    definitionInfo: DefinitionInfo;
    activeVersionContext: ActiveVersionContext;
    activeNavigationConfigContext: ActiveNavigationConfigContext;
    selectedSlug: string;
    /** Prefixes a given slug with the currently active version and tab slugs. */
    withVersionAndTabSlugs: (slug: string, opts?: WithVersionSlugOpts) => string;
    /** Prefixes a given slug with the currently active version slug. */
    withVersionSlug: (slug: string, opts?: WithVersionSlugOpts) => string;
    /** Prefixes a given slug with the currently active tab slug. */
    withTabSlug: (slug: string) => string;
}

interface ActiveVersionContextUnversioned {
    type: "unversioned";
}

interface ActiveVersionContextVersioned {
    type: "versioned";
    version: DocsNode.Version;
}

export type ActiveVersionContext = ActiveVersionContextUnversioned | ActiveVersionContextVersioned;

interface ActiveNavigationConfigContextUntabbed {
    type: "untabbed";
    config: FernRegistryDocsRead.UnversionedUntabbedNavigationConfig;
}

interface ActiveNavigationConfigContextTabbed {
    type: "tabbed";
    config: FernRegistryDocsRead.UnversionedTabbedNavigationConfig;
}

export type ActiveNavigationConfigContext = ActiveNavigationConfigContextUntabbed | ActiveNavigationConfigContextTabbed;

export function useDocsSelectors(): DocsSelectors {
    const { basePath, activeNavigatable } = useNavigationContext();

    const prefix = basePath != null && basePath.trim().length > 1 ? basePath.trim().slice(1) + "/" : "";

    const definitionInfo = useMemo(() => activeNavigatable.context.root.info, [activeNavigatable]);

    const activeVersionContext = useMemo<ActiveVersionContext>(() => {
        if (
            activeNavigatable.context.type === "versioned-tabbed" ||
            activeNavigatable.context.type === "versioned-untabbed"
        ) {
            return { type: "versioned", version: activeNavigatable.context.version };
        } else {
            return { type: "unversioned" };
        }
    }, [activeNavigatable]);

    const activeNavigationConfigContext = useMemo<ActiveNavigationConfigContext>(() => {
        if (
            activeNavigatable.context.type === "versioned-tabbed" ||
            activeNavigatable.context.type === "unversioned-tabbed"
        ) {
            return { type: "tabbed", config: activeNavigatable.context.navigationConfig };
        } else {
            return { type: "untabbed", config: activeNavigatable.context.navigationConfig };
        }
    }, [activeNavigatable]);

    const selectedSlug = getFullSlugForNavigatable(activeNavigatable, { omitDefault: true, basePath });

    const withTabSlug = useCallback(
        (slug: string) => {
            const c = activeNavigatable.context;
            if (c.type === "unversioned-tabbed" || c.type === "versioned-tabbed") {
                return joinUrlSlugs(c.tab.slug, slug);
            }
            return slug;
        },
        [activeNavigatable.context]
    );

    const withVersionSlug = useCallback(
        (slug: string, opts?: WithVersionSlugOpts) => {
            const { omitDefault = false } = opts ?? {};
            const c = activeNavigatable.context;
            if (c.type === "versioned-tabbed" || c.type === "versioned-untabbed") {
                return omitDefault && c.version.info.index === 0 ? slug : joinUrlSlugs(c.version.slug, slug);
            }
            return slug;
        },
        [activeNavigatable.context]
    );

    const withVersionAndTabSlugs = useCallback(
        (slug: string, opts?: WithVersionSlugOpts) => prefix + withVersionSlug(withTabSlug(slug), opts),
        [prefix, withVersionSlug, withTabSlug]
    );

    return {
        definitionInfo,
        activeVersionContext,
        activeNavigationConfigContext,
        selectedSlug,
        withVersionAndTabSlugs,
        withVersionSlug: useCallback((slug: string) => prefix + withVersionSlug(slug), [prefix, withVersionSlug]),
        withTabSlug: useCallback((slug: string) => prefix + withTabSlug(slug), [prefix, withTabSlug]),
    };
}
