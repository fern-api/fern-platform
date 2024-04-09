import { FernRevalidationClient } from "@fern-fern/revalidation-sdk";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

export function provideRevalidationClient(baseUrl: ParsedBaseUrl): FernRevalidationClient {
    // create a URL with the basepath
    let hostWithBasepath = new URL(baseUrl.path ?? "/", `https://${baseUrl.hostname}`).href;

    // remove trailing slash
    hostWithBasepath = hostWithBasepath.replace(/\/$/, "");

    // create a client with the basepath
    return new FernRevalidationClient({ environment: hostWithBasepath });
}
