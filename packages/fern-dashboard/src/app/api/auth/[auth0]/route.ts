import { NextRequest } from "next/server";

import {
  AppRouteHandlerFnContext,
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    const { redirectUri, returnTo } = getAuth0Urls(req);
    return await handleLogin(req, res, {
      authorizationParams: {
        redirect_uri: redirectUri,
      },
      returnTo,
    });
  },
  callback: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    const { redirectUri } = getAuth0Urls(req);
    return await handleCallback(req, res, {
      redirectUri,
    });
  },
  logout: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    const { returnTo } = getAuth0Urls(req);
    return await handleLogout(req, res, {
      returnTo,
    });
  },
});

function getAuth0Urls(req: NextRequest) {
  const protocol = req.nextUrl.protocol;
  const host = req.nextUrl.host;
  const search = req.nextUrl.search;

  return {
    baseURL: `${protocol}//${host}`,
    redirectUri: `${protocol}//${host}/api/auth/callback${search}`,
    returnTo: `${protocol}//${host}${search}`,
  };
}
