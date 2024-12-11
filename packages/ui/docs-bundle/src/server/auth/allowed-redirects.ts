import { AuthEdgeConfig } from "@fern-ui/fern-docs-auth";
import { compact } from "es-toolkit/compat";

const WORKOS_API_URL = "https://api.workos.com";

export function getAllowedRedirectUrls(authConfig?: AuthEdgeConfig | undefined): string[] {
    if (authConfig == null) {
        return [];
    }

    if (authConfig.type === "basic_token_verification") {
        return compact([authConfig.redirect, authConfig.logout]);
    }

    if (authConfig.type === "sso") {
        if (authConfig.partner === "workos") {
            return compact([WORKOS_API_URL]);
        }
    }

    return [];
}
