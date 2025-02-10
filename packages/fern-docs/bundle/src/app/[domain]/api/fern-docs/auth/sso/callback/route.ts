import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import { FernNextResponse } from "@/server/FernNextResponse";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { getWorkOSClientId, workos } from "@/server/auth/workos";
import { encryptSession } from "@/server/auth/workos-session";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

const FORWARDED_HOST_QUERY = "forwarded_host";
const CODE_QUERY = "code";
const ERROR_DESCRIPTION_QUERY = "error_description";
const ERROR_QUERY = "error";
const ERROR_URI_QUERY = "error_uri";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const errorDescription = req.nextUrl.searchParams.get(
    ERROR_DESCRIPTION_QUERY
  );
  const error = req.nextUrl.searchParams.get(ERROR_QUERY);
  const errorUri = req.nextUrl.searchParams.get(ERROR_URI_QUERY); // note: this contains reference to the WorkOS docs

  if (error != null) {
    // TODO: store this login attempt in posthog

    console.error(error, errorDescription, errorUri);
    return new NextResponse(null, { status: 400 });
  }

  // TODO: this is based on an incorrect implementation of the state param— we need to sign it with a JWT.
  const return_to_param = getReturnToQueryParam();
  const return_to = req.nextUrl.searchParams.get(return_to_param);
  const url = safeUrl(return_to ?? req.nextUrl.origin);

  if (url == null) {
    console.error(`Invalid ${return_to_param} param provided:`, return_to);
    return new NextResponse(null, { status: 400 });
  }

  // if the current url is app.buildwithfern.com, we should redirect to ***.docs.buildwithfern.com
  if (req.nextUrl.host !== url.host && getDocsDomainEdge(req) !== url.host) {
    if (
      req.nextUrl.searchParams.get(FORWARDED_HOST_QUERY) === req.nextUrl.host
    ) {
      console.error(
        FORWARDED_HOST_QUERY,
        "is the same as the host:",
        String(req.nextUrl.searchParams.get(FORWARDED_HOST_QUERY))
      );
      return new NextResponse(null, { status: 400 });
    }

    // TODO: need to support docs instances with subpaths (forward-proxied from the origin).
    const destination = new URL(
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
      url.origin
    );
    destination.searchParams.set(FORWARDED_HOST_QUERY, req.nextUrl.host);
    const allowedDestinations = [withDefaultProtocol(getDocsDomainEdge(req))];

    // if the url.host exists in the edge config, we should add it to the allowed destinations
    if (await getAuthEdgeConfig(url.host)) {
      allowedDestinations.push(url.origin);
    }

    return FernNextResponse.redirect(req, {
      destination,
      allowedDestinations,
    });
  }

  const code = req.nextUrl.searchParams.get(CODE_QUERY);

  if (code == null) {
    console.error("No code param provided");
    return new NextResponse(null, { status: 400 });
  }

  try {
    const { accessToken, refreshToken, user, impersonator } =
      await workos().userManagement.authenticateWithCode({
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

    // TODO: check if we need to run `getAllowedRedirectUrls(config)` because we don't have the edge config imported here
    const res = FernNextResponse.redirect(req, { destination: url });
    const cookieJar = await cookies();
    cookieJar.set(COOKIE_FERN_TOKEN, session, withSecureCookie(url.origin));

    return res;
  } catch (error) {
    const errorRes = {
      error: error instanceof Error ? error.message : String(error),
    };

    console.error(errorRes);

    return errorResponse();
  }
}

function errorResponse() {
  const errorBody = {
    error: {
      message: "Something went wrong",
      description:
        "Couldn't sign in. If you are not sure what happened, please contact your organization admin.",
    },
  };
  return NextResponse.json(errorBody, { status: 500 });
}
