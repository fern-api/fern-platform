import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { getAuth0Client } from "@/app/services/auth0/auth0";

import { ensureUserOwnsUrl } from "../homepage-images/auth";
import handler from "../homepage-images/generate/handler";
import { parseNextRequestBody } from "../utils/parseNextRequestBody";

export const maxDuration = 60;

const GenerateHomepageImagesRequest = z.object({
  url: z.string(),
});

export async function POST(req: NextRequest) {
  const auth0 = await getAuth0Client();
  const { token } = await auth0.getAccessToken();

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
