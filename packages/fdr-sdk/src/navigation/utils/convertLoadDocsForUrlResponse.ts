import { FernNavigation } from "../..";
import { APIV1Read, type DocsV2Read } from "../../client/types";
import { mapValues } from "../../utils";
import { NavigationConfigConverter } from "../converters/NavigationConfigConverter";
import { getFrontmatter } from "./getFrontmatter";
import { getFullSlugFromFrontmatter } from "./getFullSlugFromFrontmatter";
import { getNoIndexFromFrontmatter } from "./getNoIndexFromFrontmatter";

export function convertLoadDocsForUrlResponse(
    response: DocsV2Read.LoadDocsForUrlResponse,
    disableEndpointPairs: boolean = false,
    paginated?: boolean,
): FernNavigation.RootNode {
    const noindexMap: Record<FernNavigation.PageId, boolean> = {};
    const fullSlugMap: Record<FernNavigation.PageId, FernNavigation.Slug> = {};
    Object.entries(response.definition.pages).forEach(([pageId, page]) => {
        const frontmatter = getFrontmatter(page.markdown);
        if (frontmatter == null) {
            return;
        }

        const noindex = getNoIndexFromFrontmatter(frontmatter);
        if (noindex != null) {
            noindexMap[FernNavigation.PageId(pageId)] = noindex;
        }

        // get full slug from frontmatter
        const fullSlug = getFullSlugFromFrontmatter(frontmatter);
        if (fullSlug != null) {
            fullSlugMap[FernNavigation.PageId(pageId)] = fullSlug;
        }
    });
    return NavigationConfigConverter.convert(
        response.definition.config.title,
        response.definition.config.navigation,
        fullSlugMap,
        noindexMap,
        hackReorderApis(response.definition.apis, response.baseUrl.domain),
        response.baseUrl.basePath,
        isLexicographicSortEnabled(response.baseUrl.domain),
        disableEndpointPairs,
        paginated,
    );
}

function isLexicographicSortEnabled(domain: string): boolean {
    // HACKHACK: This is a temporary solution to enable lexicographic sorting for AIA docs.
    // Vercel's edge config UI is broken right now so we can't modify it there.
    return domain.toLowerCase().includes("aia.docs.buildwithfern.com");
}

function hackReorderApis(
    apis: Record<string, APIV1Read.ApiDefinition>,
    domain: string,
): Record<string, APIV1Read.ApiDefinition> {
    if (!domain.includes("assemblyai")) {
        return apis;
    }

    return mapValues(apis, (api) => hackReorderAssemblyApi(api));
}

function hackReorderAssemblyApi(api: APIV1Read.ApiDefinition): APIV1Read.ApiDefinition {
    const SUBPACKAGE_REALTIME = APIV1Read.SubpackageId("subpackage_realtime");
    const SUBPACKAGE_STREAMING = APIV1Read.SubpackageId("subpackage_streaming");

    const realtime = api.subpackages[SUBPACKAGE_REALTIME];
    const streaming = api.subpackages[SUBPACKAGE_STREAMING];

    if (realtime == null || streaming == null) {
        return api;
    }

    streaming.endpoints = [...realtime.endpoints, ...streaming.endpoints];
    streaming.websockets = [...realtime.websockets, ...streaming.websockets];
    streaming.webhooks = [...realtime.webhooks, ...streaming.webhooks];

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete api.subpackages[SUBPACKAGE_REALTIME];

    api.rootPackage.subpackages = api.rootPackage.subpackages.filter(
        (subpackageId) => subpackageId !== SUBPACKAGE_REALTIME,
    );

    return api;
}
