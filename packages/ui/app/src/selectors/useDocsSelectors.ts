import { DocsV1Read, type DocsNode } from "@fern-api/fdr-sdk";
import { useCallback, useMemo } from "react";
import { useNavigationContext } from "../navigation-context/useNavigationContext";
import { getFullSlugForNavigatable, joinUrlSlugs } from "../util/slug";

type WithVersionSlugOpts = {
    omitDefault?: boolean;
};

interface DocsSelectors {
    activeVersionContext: ActiveVersionContext;
    activeNavigationConfigContext: ActiveNavigationConfigContext | undefined;
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
    config: DocsV1Read.UnversionedUntabbedNavigationConfig;
}

interface ActiveNavigationConfigContextTabbed {
    type: "tabbed";
    config: DocsV1Read.UnversionedTabbedNavigationConfig;
}

export type ActiveNavigationConfigContext = ActiveNavigationConfigContextUntabbed | ActiveNavigationConfigContextTabbed;

export function useDocsSelectors(): DocsSelectors {
    const { basePath, activeNavigatable } = useNavigationContext();
    const navigationContext = activeNavigatable?.context;

    const prefix = basePath != null && basePath.trim().length > 1 ? basePath.trim().slice(1) + "/" : "";

    const activeVersionContext = useMemo<ActiveVersionContext>(() => {
        if (navigationContext?.type === "versioned-tabbed" || navigationContext?.type === "versioned-untabbed") {
            return { type: "versioned", version: navigationContext?.version };
        } else {
            return { type: "unversioned" };
        }
    }, [navigationContext]);

    const activeNavigationConfigContext = useMemo<ActiveNavigationConfigContext | undefined>(() => {
        if (navigationContext == null) {
            return undefined;
        }
        if (navigationContext.type === "versioned-tabbed" || navigationContext.type === "unversioned-tabbed") {
            return { type: "tabbed", config: navigationContext.navigationConfig };
        } else {
            return { type: "untabbed", config: navigationContext.navigationConfig };
        }
    }, [navigationContext]);

    const selectedSlug = getFullSlugForNavigatable(activeNavigatable, { omitDefault: true, basePath });

    const withTabSlug = useCallback(
        (slug: string) => {
            const c = navigationContext;
            if (c?.type === "unversioned-tabbed" || c?.type === "versioned-tabbed") {
                return joinUrlSlugs(c?.tab.slug, slug);
            }
            return slug;
        },
        [navigationContext],
    );

    const withVersionSlug = useCallback(
        (slug: string, opts?: WithVersionSlugOpts) => {
            const { omitDefault = false } = opts ?? {};
            const c = navigationContext;
            if (c?.type === "versioned-tabbed" || c?.type === "versioned-untabbed") {
                return omitDefault && c?.version.info.index === 0 ? slug : joinUrlSlugs(c.version.slug, slug);
            }
            return slug;
        },
        [navigationContext],
    );

    const withVersionAndTabSlugs = useCallback(
        (slug: string, opts?: WithVersionSlugOpts) => prefix + withVersionSlug(withTabSlug(slug), opts),
        [prefix, withVersionSlug, withTabSlug],
    );

    return {
        activeVersionContext,
        activeNavigationConfigContext,
        selectedSlug,
        withVersionAndTabSlugs,
        withVersionSlug: useCallback((slug: string) => prefix + withVersionSlug(slug), [prefix, withVersionSlug]),
        withTabSlug: useCallback((slug: string) => prefix + withTabSlug(slug), [prefix, withTabSlug]),
    };
}
