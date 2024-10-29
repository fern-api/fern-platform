import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { getWorkOSClientId, workos } from "@/server/auth/workos";
import { encryptSession } from "@/server/auth/workos-session";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const FORWARDED_HOST_QUERY = "forwarded_host";
const STATE_QUERY = "state";
const CODE_QUERY = "code";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const state = req.nextUrl.searchParams.get(STATE_QUERY);

    if (state == null) {
        // eslint-disable-next-line no-console
        console.error("No state param provided");
        return new NextResponse(null, { status: 400 });
    }

    // TODO: this is based on an incorrect implementation of the state param— we need to sign it with a JWT.
    const url = safeUrl(state);

    if (url == null) {
        // eslint-disable-next-line no-console
        console.error("Invalid state param provided:", state);
        return new NextResponse(null, { status: 400 });
    }

    // TODO: this is a security risk (open redirect)! We need to verify that the target host is one of ours.
    // if the current url is app.buildwithfern.com, we should redirect to ***.docs.buildwithfern.com
    if (req.nextUrl.host !== url.host && getDocsDomainEdge(req) !== url.host) {
        if (req.nextUrl.searchParams.get(FORWARDED_HOST_QUERY) === req.nextUrl.host) {
            // eslint-disable-next-line no-console
            console.error(
                FORWARDED_HOST_QUERY,
                "is the same as the host:",
                String(req.nextUrl.searchParams.get(FORWARDED_HOST_QUERY)),
            );
            return new NextResponse(null, { status: 400 });
        }

        // TODO: need to support docs instances with subpaths (forward-proxied from the origin).
        const destination = new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, url.origin);
        destination.searchParams.set(FORWARDED_HOST_QUERY, req.nextUrl.host);
        return NextResponse.redirect(destination);
    }

    const code = req.nextUrl.searchParams.get(CODE_QUERY);

    if (code == null) {
        // eslint-disable-next-line no-console
        console.error("No code param provided");
        return new NextResponse(null, { status: 400 });
    }

    try {
        const { accessToken, refreshToken, user, impersonator } = await workos().userManagement.authenticateWithCode({
            code,
            clientId: getWorkOSClientId(),
        });

        if (!accessToken || !refreshToken) {
            throw new Error("response is missing tokens");
        }

        const session = await encryptSession({
            accessToken,
            refreshToken,
            user,
            impersonator,
        });

        const res = NextResponse.redirect(url);
        res.cookies.set(COOKIE_FERN_TOKEN, session, withSecureCookie(url.origin));

        return res;
    } catch (error) {
        const errorRes = {
            error: error instanceof Error ? error.message : String(error),
        };

        // eslint-disable-next-line no-console
        console.error(errorRes);

        return errorResponse();
    }
}

function errorResponse() {
    const errorBody = {
        error: {
            message: "Something went wrong",
            description: "Couldn't sign in. If you are not sure what happened, please contact your organization admin.",
        },
    };
    return NextResponse.json(errorBody, { status: 500 });
}
