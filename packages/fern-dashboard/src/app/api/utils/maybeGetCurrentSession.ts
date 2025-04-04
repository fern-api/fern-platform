import { NextRequest, NextResponse } from "next/server";

import {
  decodeAccessToken,
  getCurrentSession,
} from "@/app/services/auth0/getCurrentSession";
import { Auth0OrgID, Auth0UserID } from "@/app/services/auth0/types";

import { MaybeErrorResponse } from "./MaybeErrorResponse";
import { parseAuthHeader } from "./parseAuthHeader";

export interface ApiSessionData {
  token: string;
  userId: Auth0UserID;
  orgId: Auth0OrgID;
}

export async function maybeGetCurrentSession(
  req: NextRequest
): Promise<MaybeErrorResponse<ApiSessionData>> {
  try {
    if (req.headers.get("authorization") != null) {
      const { token } = parseAuthHeader(req);
      const { userId, orgId } = decodeAccessToken(token);
      return { data: { token, userId, orgId } };
    }

    const sessionData = await getCurrentSession();
    return {
      data: {
        token: sessionData.session.tokenSet.accessToken,
        userId: sessionData.userId,
        orgId: sessionData.orgId,
      },
    };
  } catch (e) {
    console.error("Failed to get session data", e);
    return {
      errorResponse: NextResponse.json({}, { status: 401 }),
    };
  }
}
