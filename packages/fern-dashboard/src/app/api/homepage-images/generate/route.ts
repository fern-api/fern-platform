import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { maybeGetCurrentSession } from "../../utils/maybeGetCurrentSession";
import { parseNextRequestBody } from "../../utils/parseNextRequestBody";
import { ensureOrgOwnsUrl } from "../auth";
import handler from "./handler";

export const maxDuration = 60;

const GenerateHomepageImagesRequest = z.object({
  url: z.string(),
});

export async function POST(req: NextRequest) {
  const maybeSessionData = await maybeGetCurrentSession(req);
  if (maybeSessionData.errorResponse != null) {
    return maybeSessionData.errorResponse;
  }
  const { orgId, token } = maybeSessionData.data;

  const parsedBody = await parseNextRequestBody(
    req,
    GenerateHomepageImagesRequest
  );
  if (parsedBody.errorResponse != null) {
    return parsedBody.errorResponse;
  }
  const { url } = parsedBody.data;

  const ensureOrgOwnsUrlResponse = await ensureOrgOwnsUrl({
    url,
    orgId,
    token,
  });
  if (ensureOrgOwnsUrlResponse.errorResponse != null) {
    return ensureOrgOwnsUrlResponse.errorResponse;
  }

  const handlerResponse = await handler({ url });
  if (handlerResponse.errorResponse != null) {
    return handlerResponse.errorResponse;
  }

  return NextResponse.json({});
}
