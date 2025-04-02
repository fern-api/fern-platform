import { NextResponse } from "next/server";

import {
  FullSessionData,
  getCurrentSession,
} from "@/app/services/auth0/getCurrentSession";

import { MaybeErrorResponse } from "./MaybeErrorResponse";

export async function maybeGetCurrentSession(): Promise<
  MaybeErrorResponse<FullSessionData>
> {
  try {
    const sessionData = await getCurrentSession();
    return { data: sessionData };
  } catch (e) {
    console.error("Failed to get session data", e);
    return {
      errorResponse: NextResponse.json({}, { status: 401 }),
    };
  }
}
