import { NextRequest, NextResponse } from "next/server";

import { ensureUserBelongsToOrg } from "@/app/services/auth0/management";
import { ResolvedReturnType } from "@/utils/types";

import { maybeGetCurrentSession } from "../utils/maybeGetCurrentSession";
import handler from "./handler";

export declare namespace getOrgMembers {
  export type Response = ResolvedReturnType<typeof handler>;
}

export async function GET(req: NextRequest) {
  const maybeSessionData = await maybeGetCurrentSession(req);

  if (maybeSessionData.errorResponse != null) {
    return maybeSessionData.errorResponse;
  }
  const { userId, orgId } = maybeSessionData.data;
  await ensureUserBelongsToOrg(userId, orgId);

  return NextResponse.json(await handler({ userId, orgId }));
}
