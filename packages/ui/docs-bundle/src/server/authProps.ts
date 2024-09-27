import { getAuthEdgeConfig, verifyFernJWTConfig, type FernUser } from "@fern-ui/ui/auth";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";

export interface AuthProps {
    token: string;
    user: FernUser;
    cookies: NextApiRequestCookies;
}

/**
 * In Venus, workos tokens are prefixed with "workos_" to differentiate them from "fern_" tokens.
 */
function withPrefix(token: string, partner: FernUser["partner"]): string {
    return `${partner}_${token}`;
}

export async function withAuthProps(xFernHost: string, cookies: NextApiRequestCookies): Promise<AuthProps> {
    if (cookies.fern_token == null) {
        throw new Error("Missing fern_token cookie");
    }
    const config = await getAuthEdgeConfig(xFernHost);
    const user: FernUser = await verifyFernJWTConfig(cookies.fern_token, config);
    const token = withPrefix(cookies.fern_token, user.partner);

    const authProps: AuthProps = {
        token,
        user,
        cookies,
    };

    return authProps;
}
