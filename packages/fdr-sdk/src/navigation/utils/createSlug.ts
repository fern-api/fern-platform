import urljoin from "url-join";
import { FernNavigation } from "../generated";

export function createSlug(
    baseSlug: string,
    parentSlug: string,
    {
        fullSlug,
        urlSlug,
        skipUrlSlug,
    }: {
        fullSlug?: string[];
        skipUrlSlug?: boolean;
        urlSlug: string;
    },
): FernNavigation.Slug {
    if (fullSlug != null) {
        const slug = urljoin(fullSlug);
        if (slug.startsWith(baseSlug) && (slug.length === baseSlug.length || slug[baseSlug.length] === "/")) {
            return FernNavigation.Slug(slug);
        }
        return FernNavigation.Slug(urljoin(baseSlug, slug));
    }

    if (skipUrlSlug) {
        return FernNavigation.Slug(parentSlug);
    }

    return FernNavigation.Slug(urljoin(parentSlug, urlSlug));
}
