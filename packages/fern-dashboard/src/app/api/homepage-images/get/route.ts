import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ResolvedReturnType } from "@/utils/types";

import { maybeGetCurrentSession } from "../../utils/maybeGetCurrentSession";
import { parseNextRequestBody } from "../../utils/parseNextRequestBody";
import { ensureOrgOwnsUrl } from "../auth";
import handler from "./handler";

export const maxDuration = 60;

export declare namespace getHomepageImages {
  export type Request = z.infer<typeof GetHomepageImagesRequest>;
  export type Response = ResolvedReturnType<typeof handler>;
}

const GetHomepageImagesRequest = z.object({
  url: z.string(),
});

export async function GET(req: NextRequest) {
  const maybeSessionData = await maybeGetCurrentSession();
  if (maybeSessionData.errorResponse != null) {
    return maybeSessionData.errorResponse;
  }
  const { session, orgId } = maybeSessionData.data;
  const token = session.tokenSet.accessToken;

  const parsedBody = await parseNextRequestBody(req, GetHomepageImagesRequest);
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
