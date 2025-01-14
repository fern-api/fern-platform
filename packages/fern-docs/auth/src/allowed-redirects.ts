/**
 * In order to prevent open-redirection, we need to curate a list of allowed domains where the server can redirect to.
 */

import { compact } from "es-toolkit/array";
import { UnreachableCaseError } from "ts-essentials";
import type {
  AuthEdgeConfig,
  OAuth2,
  PreviewUrlAuth,
  SSOWorkOS,
} from "./types";

const WORKOS_API_URL = "https://api.workos.com";
const WEBFLOW_API_URL = "https://webflow.com";

export function getAllowedRedirectUrls(
  authConfig?: AuthEdgeConfig | undefined,
  previewAuthConfig?: PreviewUrlAuth | undefined
): string[] {
  return [
    ...getAllowedRedirectUrlsForAuthConfig(authConfig),
    ...getAllowedRedirectUrlsForPreviewAuthConfig(previewAuthConfig),
  ];
}

function getAllowedRedirectUrlsForAuthConfig(authConfig?: AuthEdgeConfig) {
  if (authConfig == null) {
    return [];
  }

  switch (authConfig.type) {
    case "basic_token_verification":
      // since the `redirect` and `logout` are configured in the edge config, we can trust them
      return compact([authConfig.redirect, authConfig.logout]);
    case "sso":
      return getAllowedRedirectUrlsForSSO(authConfig);
    case "oauth2":
      return getAllowedRedirectUrlsForOAuth2(authConfig);
    default:
      console.error(new UnreachableCaseError(authConfig));
  }

  return [];
}

function getAllowedRedirectUrlsForPreviewAuthConfig(
  previewAuthConfig?: PreviewUrlAuth
) {
  if (previewAuthConfig == null) {
    return [];
  }

  switch (previewAuthConfig.type) {
    case "workos":
      return [WORKOS_API_URL];
    default:
      console.error(new UnreachableCaseError(previewAuthConfig.type));
  }

  return [];
}

function getAllowedRedirectUrlsForSSO(_authConfig: SSOWorkOS) {
  return [WORKOS_API_URL];
}

function getAllowedRedirectUrlsForOAuth2(authConfig: OAuth2) {
  switch (authConfig.partner) {
    case "ory":
      // since the environment is configured in the edge config, we can trust it
      return [authConfig.environment];
    case "webflow":
      return [WEBFLOW_API_URL];
    default:
      console.error(new UnreachableCaseError(authConfig));
  }

  return [];
}
