import { joinUrlSlugs } from "@fern-ui/app-utils";

export function withBasePath(basePath: string | undefined, slug: string): string {
    return basePath != null ? `${joinUrlSlugs(basePath, slug)}` : `/${slug}`;
}
