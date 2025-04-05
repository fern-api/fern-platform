import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import * as auth0Management from "@/app/services/auth0/management";
import { ResolvedReturnType } from "@/utils/types";

import { maybeGetCurrentSession } from "../utils/maybeGetCurrentSession";
import { parseNextRequestBody } from "../utils/parseNextRequestBody";
import handler from "./handler";

export declare namespace getDocsUrlOwner {
  export type Request = z.infer<typeof GetDocsUrlOwnerRequest>;
  export type Response = ResolvedReturnType<typeof handler>;
}

const GetDocsUrlOwnerRequest = z.object({
  url: z.string(),
});

export async function POST(req: NextRequest) {
  const maybeSessionData = await maybeGetCurrentSession(req);
  if (maybeSessionData.errorResponse != null) {
    return maybeSessionData.errorResponse;
  }
  const { userId, token } = maybeSessionData.data;

  const parsedBody = await parseNextRequestBody(req, GetDocsUrlOwnerRequest);
  if (parsedBody.errorResponse != null) {
    return parsedBody.errorResponse;
  }
  const { url } = parsedBody.data;

  let response = await handler({ token, url });
  if (response.orgId != null) {
    const doesUserBelongToOrg = await auth0Management.doesUserBelongsToOrg(
      userId,
      response.orgId
    );
    if (!doesUserBelongToOrg) {
      response = { orgId: undefined };
    }
  }

  return NextResponse.json(response);
}
