import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ensureUserOwnsUrl } from "../homepage-images/auth";
import handler from "../homepage-images/generate/handler";
import { parseAuthHeader } from "../utils/parseAuthHeader";
import { parseNextRequestBody } from "../utils/parseNextRequestBody";

export const maxDuration = 60;

const GenerateHomepageImagesRequest = z.object({
  url: z.string(),
});

export async function POST(req: NextRequest) {
  let token: string;
  try {
    const parsedAuthHeader = parseAuthHeader(req);
    token = parsedAuthHeader.token;
  } catch (e) {
    console.error("Failed to parse auth header", e);
    return NextResponse.json({}, { status: 401 });
  }

  const parsedBody = await parseNextRequestBody(
    req,
    GenerateHomepageImagesRequest
  );
  if (parsedBody.errorResponse != null) {
    return parsedBody.errorResponse;
  }
  const { url } = parsedBody.data;

  const ensureUserOwnsUrlResponse = await ensureUserOwnsUrl({ token, url });
  if (ensureUserOwnsUrlResponse.errorResponse != null) {
    return ensureUserOwnsUrlResponse.errorResponse;
  }

  const handlerResponse = await handler({ url });
  if (handlerResponse.errorResponse != null) {
    return handlerResponse.errorResponse;
  }

  return NextResponse.json({});
}
