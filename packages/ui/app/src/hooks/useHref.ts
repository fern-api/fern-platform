import { FernNavigation } from "@fern-api/fdr-sdk";
import { Atom, useAtomValue } from "jotai";
import { TRAILING_SLASH_ATOM } from "../atoms";

export function getToHref(trailingSlash: boolean = false): (slug: FernNavigation.Slug) => string {
    return (slug) => (trailingSlash ? `/${slug}/` : `/${slug}`);
}

export function useToHref(): (slug: FernNavigation.Slug) => string {
    return getToHref(useAtomValue(TRAILING_SLASH_ATOM));
}

export function useHref(slug: FernNavigation.Slug, anchor?: string): string;
export function useHref(slug: FernNavigation.Slug | undefined, anchor?: string): string | undefined;
export function useHref(slug: FernNavigation.Slug | undefined, anchor?: string): string | undefined {
    const toHref = useToHref();
    if (slug == null) {
        return anchor;
    }
    const pathName = toHref(slug);
    return anchor != null ? `${pathName}#${anchor}` : pathName;
}

export function selectHref(get: <T>(atom: Atom<T>) => T, slug: FernNavigation.Slug): string {
    return get(TRAILING_SLASH_ATOM) ? `/${slug}/` : `/${slug}`;
}
