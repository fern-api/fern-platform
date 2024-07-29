import { APIV1Read, DocsV2Read } from "../../client";
import { mapValues } from "../../utils";
import { NavigationConfigConverter } from "../converters/NavigationConfigConverter";
import { FernNavigation } from "../generated";
import { getNoIndexFromFrontmatter } from "./getNoIndexFromFrontmatter";

export function convertLoadDocsForUrlResponse(
    response: DocsV2Read.LoadDocsForUrlResponse,
    disableEndpointPairs: boolean = false,
    disableLongScrolling?: boolean,
): FernNavigation.RootNode {
    const noindexMap: Record<FernNavigation.PageId, boolean> = {};
    Object.entries(response.definition.pages).forEach(([pageId, page]) => {
        const noindex = getNoIndexFromFrontmatter(page.markdown);
        if (noindex != null) {
            noindexMap[FernNavigation.PageId(pageId)] = noindex;
        }
    });
    return NavigationConfigConverter.convert(
        response.definition.config.title,
        response.definition.config.navigation,
        noindexMap,
        hackReorderApis(response.definition.apis, response.baseUrl.domain),
        response.baseUrl.basePath,
        isLexicographicSortEnabled(response.baseUrl.domain),
        disableEndpointPairs,
        disableLongScrolling,
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
    const SUBPACKAGE_REALTIME = "subpackage_realtime";
    const SUBPACKAGE_STREAMING = "subpackage_streaming";

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
