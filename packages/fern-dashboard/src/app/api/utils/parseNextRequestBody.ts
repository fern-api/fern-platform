import { NextRequest, NextResponse } from "next/server";

import { ZodType } from "zod";

import { MaybeErrorResponse } from "./MaybeErrorResponse";

export async function parseNextRequestBody<T>(
  req: NextRequest,
  schema: ZodType<T>
): Promise<MaybeErrorResponse<T>> {
  let requestJson: unknown;
  try {
    requestJson = await req.json();
  } catch (e) {
    console.error("Failed to deserialize request body", e);
    return {
      errorResponse: NextResponse.json(
        { message: "Request is not JSON" },
        { status: 422 }
      ),
    };
  }

  return safeParseJson(requestJson, schema);
}

export function safeParseJson<T>(
  requestJson: unknown,
  schema: ZodType<T>
): MaybeErrorResponse<T> {
  const request = schema.safeParse(requestJson);
  if (!request.success) {
    console.error(
      "Failed to validate request body",
      JSON.stringify(request.error)
    );
    return {
      errorResponse: NextResponse.json(
        { message: "Failed to parse request", error: request.error },
        { status: 422 }
      ),
    };
  }

  return { data: request.data };
}
