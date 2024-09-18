import type { FdrAPI } from "@fern-api/fdr-sdk";
import type { APIResponse } from "@fern-fern/fern-docs-sdk/core";
import { getRegistryServiceWithToken, provideRegistryService } from "@fern-ui/ui";
import { trackPromise } from "./analytics/track-promise";
import type { AuthProps } from "./authProps";
import { TRACK_LOAD_DOCS_FROM_FDR } from "./constants";

export async function loadDocsAndTrack(
    host: string,
    slug: string[],
    auth?: AuthProps,
): Promise<APIResponse<FdrAPI.docs.v2.read.LoadDocsForUrlResponse, FdrAPI.docs.v2.read.getDocsForUrl.Error>> {
    const client = auth != null && auth.token ? getRegistryServiceWithToken(auth.token) : provideRegistryService();
    return trackPromise({
        promise: client.docs.v2.read.getDocsForUrl({ url: host }),
        key: TRACK_LOAD_DOCS_FROM_FDR,
        auth: auth?.user.partner,
        host,
        slug,
    });
}
