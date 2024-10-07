import { AuthEdgeConfig } from "@fern-ui/ui/auth";
import type { NextRequest } from "next/server";
import { withBasicTokenPublic } from "../withBasicTokenPublic";
import { verifyFernJWT } from "./FernJWT";

export async function checkViewerAllowedEdge(auth: AuthEdgeConfig | undefined, req: NextRequest): Promise<number> {
    const fern_token = req.cookies.get("fern_token")?.value;

    return checkViewerAllowedPathname(auth, req.nextUrl.pathname, fern_token);
}

export async function checkViewerAllowedPathname(
    auth: AuthEdgeConfig | undefined,
    pathname: string,
    fern_token: string | undefined,
): Promise<number> {
    if (auth?.type === "basic_token_verification") {
        if (withBasicTokenPublic(auth, pathname)) {
            return 200;
        }

        if (fern_token == null) {
            return 401;
        } else {
            const verified = await verifyFernJWT(fern_token, auth.secret, auth.issuer);
            if (!verified) {
                return 403;
            }
        }
    }
    return 200;
}
