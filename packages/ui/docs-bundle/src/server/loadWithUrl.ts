import { APIResponse, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { withoutStaging } from "@fern-ui/fern-docs-utils";
import { getRegistryServiceWithToken, provideRegistryService } from "@fern-ui/ui";
import type { AuthProps } from "./authProps";

export type LoadWithUrlResponse = APIResponse<
    FdrAPI.docs.v2.read.LoadDocsForUrlResponse,
    FdrAPI.docs.v2.read.getDocsForUrl.Error
>;

/**
 * - If the token is a WorkOS token, we need to use the getPrivateDocsForUrl endpoint.
 * - Otherwise, we can use the getDocsForUrl endpoint (including custom auth).
 */
export async function loadWithUrl(url: string, auth?: AuthProps): Promise<LoadWithUrlResponse> {
    url = withoutStaging(url);

    if (auth != null && auth.user.partner === "workos") {
        return getRegistryServiceWithToken(auth.token).docs.v2.read.getPrivateDocsForUrl({
            url: FdrAPI.Url(url),
        });
    } else {
        return provideRegistryService().docs.v2.read.getDocsForUrl({ url: FdrAPI.Url(url) });
    }
}
