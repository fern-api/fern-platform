import { NextRequest, NextResponse } from "next/server";

import { ResolvedReturnType } from "@/utils/types";

import { maybeGetCurrentSession } from "../utils/maybeGetCurrentSession";
import handler from "./handler";

export declare namespace getMyDocsSites {
  export type Response = ResolvedReturnType<typeof handler>;
}

export async function GET(req: NextRequest) {
  const maybeSessionData = await maybeGetCurrentSession(req);
  if (maybeSessionData.errorResponse != null) {
    return maybeSessionData.errorResponse;
  }
  const { orgId, token } = maybeSessionData.data;

  return NextResponse.json(await handler({ orgId, token }));
}
