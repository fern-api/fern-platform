import { FernNavigation } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { TRAILING_SLASH_ATOM } from "../atoms";

export function useRouteId(slug: FernNavigation.Slug, anchor?: string): string;
export function useRouteId(slug?: FernNavigation.Slug, anchor?: string): string | undefined;
export function useRouteId(slug?: FernNavigation.Slug, anchor?: string): string | undefined {
    const trailingSlash = useAtomValue(TRAILING_SLASH_ATOM);
    if (slug == null) {
        return anchor;
    }
    const pathName = trailingSlash ? `/${slug}/` : `/${slug}`;
    return anchor != null ? `${pathName}#${anchor}` : pathName;
}
