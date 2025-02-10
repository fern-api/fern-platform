import qs from "qs";

import type { OAuth2Webflow } from "@fern-docs/auth";

export function getWebflowAuthorizationUrl(
  authConfig: OAuth2Webflow,
  {
    state,
    redirectUri,
  }: {
    state?: string;
    redirectUri?: string;
  }
): string {
  const params: Record<string, string> = {
    response_type: "code",
    client_id: authConfig.clientId,
  };
  if (authConfig.redirectUri != null) {
    params.redirect_uri = authConfig.redirectUri;
  } else if (redirectUri != null) {
    params.redirect_uri = redirectUri;
  }
  if (state != null) {
    params.state = state;
  }
  if (typeof authConfig.scope === "string") {
    params.scope = authConfig.scope;
  } else if (authConfig.scope != null) {
    params.scope = authConfig.scope.join(" ");
  }
  return `https://webflow.com/oauth/authorize?${qs.stringify(params)}`;
}
