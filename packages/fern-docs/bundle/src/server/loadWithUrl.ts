import { APIResponse, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { withoutStaging } from "@fern-docs/utils";
import { provideRegistryService } from "@fern-docs/ui";

export type LoadWithUrlResponse = APIResponse<
    FdrAPI.docs.v2.read.LoadDocsForUrlResponse,
    FdrAPI.docs.v2.read.getDocsForUrl.Error
>;

/**
 * - If the token is a WorkOS token, we need to use the getPrivateDocsForUrl endpoint.
 * - Otherwise, we can use the getDocsForUrl endpoint (including custom auth).
 */
export function loadWithUrl(url: string): Promise<LoadWithUrlResponse> {
    return provideRegistryService().docs.v2.read.getDocsForUrl({
        url: FdrAPI.Url(withoutStaging(url)),
    });
}
