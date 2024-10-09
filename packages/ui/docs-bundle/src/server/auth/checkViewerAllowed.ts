import { AuthEdgeConfig } from "@fern-ui/fern-docs-auth";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import type { NextRequest } from "next/server";
import { withBasicTokenAnonymous } from "../withBasicTokenAnonymous";
import { verifyFernJWT } from "./FernJWT";

export async function checkViewerAllowedEdge(auth: AuthEdgeConfig | undefined, req: NextRequest): Promise<number> {
    const fernToken = req.cookies.get(COOKIE_FERN_TOKEN)?.value;

    return checkViewerAllowedPathname(auth, req.nextUrl.pathname, fernToken);
}

export async function checkViewerAllowedPathname(
    auth: AuthEdgeConfig | undefined,
    pathname: string,
    fernToken: string | undefined,
): Promise<number> {
    if (auth?.type === "basic_token_verification") {
        if (withBasicTokenAnonymous(auth, pathname)) {
            return 200;
        }

        if (fernToken == null) {
            return 401;
        } else {
            const verified = await verifyFernJWT(fernToken, auth.secret, auth.issuer);
            if (!verified) {
                return 403;
            }
        }
    }
    return 200;
}
