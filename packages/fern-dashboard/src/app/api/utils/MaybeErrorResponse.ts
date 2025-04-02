import { NextResponse } from "next/server";

export type MaybeErrorResponse<T = undefined> =
  | { data: T; errorResponse?: never }
  | { data?: never; errorResponse: NextResponse };
