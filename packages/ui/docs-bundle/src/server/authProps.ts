import type { FernUser } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { verifyFernJWTConfig } from "./auth/FernJWT";

export interface AuthProps {
    token: string;
    user: FernUser;
}

/**
 * In Venus, workos tokens are prefixed with "workos_" to differentiate them from "fern_" tokens.
 */
function withPrefix(token: string, partner: FernUser["partner"]): string {
    return `${partner}_${token}`;
}

export async function withAuthProps(xFernHost: string, fernToken: string | null | undefined): Promise<AuthProps> {
    if (fernToken == null) {
        throw new Error("Missing fern_token cookie");
    }
    const config = await getAuthEdgeConfig(xFernHost);
    const user: FernUser = await verifyFernJWTConfig(fernToken, config);
    const token = withPrefix(fernToken, user.partner);

    const authProps: AuthProps = {
        token,
        user,
    };

    return authProps;
}
