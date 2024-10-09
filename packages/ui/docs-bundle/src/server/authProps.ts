import type { AuthEdgeConfig, FernUser } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { verifyFernJWTConfig } from "./auth/FernJWT";

export type AuthPartner = "workos" | "ory" | "webflow" | "custom";

export interface AuthProps {
    token: string;
    user: FernUser;
    partner: AuthPartner;
}

/**
 * In Venus, workos tokens are prefixed with "workos_" to differentiate them from "fern_" tokens.
 */
function withPrefix(token: string, partner: AuthPartner): string {
    return `${partner}_${token}`;
}

export async function withAuthProps(
    xFernHostOrAuthConfig: string | AuthEdgeConfig,
    fernToken: string | null | undefined,
): Promise<AuthProps> {
    if (fernToken == null) {
        throw new Error("Missing fern_token cookie");
    }
    const config =
        typeof xFernHostOrAuthConfig === "string"
            ? await getAuthEdgeConfig(xFernHostOrAuthConfig)
            : xFernHostOrAuthConfig;
    const partner =
        config?.type === "oauth2" ? config.partner : config?.type === "basic_token_verification" ? "custom" : "workos";
    const user: FernUser = await verifyFernJWTConfig(fernToken, config);
    const token = withPrefix(fernToken, partner);

    const authProps: AuthProps = {
        token,
        user,
        partner,
    };

    return authProps;
}
