import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { SidebarNavigationRaw } from "./types";

interface Redirect {
    type: "redirect";
    redirect: string;
}

interface Found {
    type: "found";
    found: SidebarNavigationRaw;
}

export function getNavigationRoot(
    _slugArray: string[],
    _domain: string,
    _basePath: string | undefined,
    _nav: DocsV1Read.NavigationConfig,
    _apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    _pages: Record<string, DocsV1Read.PageContent>,
): Found | Redirect | undefined {
    return undefined;
}
