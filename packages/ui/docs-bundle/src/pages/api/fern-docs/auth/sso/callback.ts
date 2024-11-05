import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { getWorkOSClientId, workos } from "@/server/auth/workos";
import { encryptSession } from "@/server/auth/workos-session";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const FORWARDED_HOST_QUERY = "forwarded_host";
const CODE_QUERY = "code";
const ERROR_DESCRIPTION_QUERY = "error_description";
const ERROR_QUERY = "error";
const ERROR_URI_QUERY = "error_uri";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const errorDescription = req.nextUrl.searchParams.get(ERROR_DESCRIPTION_QUERY);
    const error = req.nextUrl.searchParams.get(ERROR_QUERY);
    const errorUri = req.nextUrl.searchParams.get(ERROR_URI_QUERY); // note: this contains reference to the WorkOS docs

    if (error != null) {
        // TODO: store this login attempt in posthog
        // eslint-disable-next-line no-console
        console.error(error, errorDescription, errorUri);
        return new NextResponse(null, { status: 400 });
    }

    // TODO: this is based on an incorrect implementation of the state param— we need to sign it with a JWT.
    const return_to_param = getReturnToQueryParam();
    const return_to = req.nextUrl.searchParams.get(return_to_param);
    const url = safeUrl(return_to ?? req.nextUrl.origin);

    if (url == null) {
        // eslint-disable-next-line no-console
        console.error(`Invalid ${return_to_param} param provided:`, return_to);
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
