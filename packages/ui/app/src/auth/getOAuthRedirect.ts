import urlJoin from "url-join";
import { OAuthEdgeConfig } from "./types";

export function getOAuthRedirect(config: OAuthEdgeConfig): string | undefined {
    if (config.partner !== "ory") {
        return undefined;
    }
    const url = new URL(urlJoin(config.environment, "/auth"));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("scope", "offline_access");
    return url.toString();
}
