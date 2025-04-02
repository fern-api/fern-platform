import { NextResponse } from "next/server";

import { ResolvedReturnType } from "@/utils/types";

import { maybeGetCurrentSession } from "../utils/maybeGetCurrentSession";
import handler from "./handler";

export declare namespace getMyDocsSites {
  export type Response = ResolvedReturnType<typeof handler>;
}

export async function GET() {
  const maybeSessionData = await maybeGetCurrentSession();
  if (maybeSessionData.errorResponse != null) {
    return maybeSessionData.errorResponse;
  }
  const { session, orgId } = maybeSessionData.data;

  return NextResponse.json(
    await handler({
      orgId: orgId,
      token: session.tokenSet.accessToken,
    })
  );
}
