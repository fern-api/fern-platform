import { NextResponse } from "next/server";

import {
  FullSessionData,
  getCurrentSession,
} from "@/app/services/auth0/getCurrentSession";
import { ResolvedReturnType } from "@/utils/types";

import handler from "./handler";

export declare namespace getMyDocsSites {
  export type Response = ResolvedReturnType<typeof handler>;
}

export async function GET() {
  let sessionData: FullSessionData;
  try {
    sessionData = await getCurrentSession();
  } catch (e) {
    console.error("Failed to get session data", e);
    return NextResponse.json({}, { status: 401 });
  }
  const { session, orgId } = sessionData;

  return NextResponse.json(
    await handler({
      orgId: orgId,
      token: session.tokenSet.accessToken,
    })
  );
}
