import { AuthEdgeConfig } from "@fern-ui/ui/auth";
import { captureException } from "@sentry/nextjs";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import { withBasicTokenViewAllowed } from "../withBasicTokenViewAllowed";
import { verifyFernJWT } from "./FernJWT";

export async function checkViewerAllowedEdge(auth: AuthEdgeConfig | undefined, req: NextRequest): Promise<number> {
    const fern_token = req.cookies.get("fern_token")?.value;

    if (auth?.type === "basic_token_verification") {
        if (withBasicTokenViewAllowed(auth.allowlist, req.nextUrl.pathname)) {
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

export async function checkViewerAllowedNode(auth: AuthEdgeConfig | undefined, req: NextApiRequest): Promise<number> {
    const fern_token = req.cookies.fern_token;

    if (auth?.type === "basic_token_verification") {
        try {
            if (req.url && withBasicTokenViewAllowed(auth.allowlist, new URL(req.url).pathname)) {
                return 200;
            }
        } catch (e) {
            // something went wrong with the URL parsing
            captureException(e);
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
