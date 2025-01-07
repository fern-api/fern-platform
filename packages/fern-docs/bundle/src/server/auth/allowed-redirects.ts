import { AuthEdgeConfig, OAuth2, SSOWorkOS } from "@fern-docs/auth";
import { PreviewUrlAuth } from "@fern-docs/edge-config";
import { compact } from "es-toolkit/array";
import { UnreachableCaseError } from "ts-essentials";

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
      return [authConfig.environment];
    case "webflow":
      return [WEBFLOW_API_URL];
    default:
      console.error(new UnreachableCaseError(authConfig));
  }

  return [];
}
