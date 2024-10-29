import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { getWorkOSClientId, workos } from "@/server/auth/workos";
import { encryptSession } from "@/server/auth/workos-session";
import { safeUrl } from "@/server/safeUrl";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const state = req.nextUrl.searchParams.get("state");

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
    if (req.nextUrl.host !== url.host) {
        return NextResponse.redirect(new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, url.origin));
    }

    const code = req.nextUrl.searchParams.get("code");

    if (code == null) {
        // eslint-disable-next-line no-console
        console.error("No code param provided");
        return new NextResponse(null, { status: 400 });
    }

    try {
        const { accessToken, refreshToken, user, impersonator } = await workos.userManagement.authenticateWithCode({
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
