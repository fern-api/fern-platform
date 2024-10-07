import type { FernUser } from "@fern-ui/ui/auth";
import { verifyFernJWTConfig } from "./auth/FernJWT";
import { getAuthEdgeConfig } from "./auth/getAuthEdgeConfig";

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

export async function withAuthProps(xFernHost: string, fern_token: string | null | undefined): Promise<AuthProps> {
    if (fern_token == null) {
        throw new Error("Missing fern_token cookie");
    }
    const config = await getAuthEdgeConfig(xFernHost);
    const user: FernUser = await verifyFernJWTConfig(fern_token, config);
    const token = withPrefix(fern_token, user.partner);

    const authProps: AuthProps = {
        token,
        user,
    };

    return authProps;
}
