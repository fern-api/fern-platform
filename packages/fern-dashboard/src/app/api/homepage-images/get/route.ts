import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ResolvedReturnType } from "@/utils/types";

import { maybeGetCurrentSession } from "../../utils/maybeGetCurrentSession";
import { parseNextRequestBody } from "../../utils/parseNextRequestBody";
import { ensureOrgOwnsUrl } from "../auth";
import handler from "./handler";

export const maxDuration = 60;

export declare namespace getHomepageImageUrl {
  export type Request = z.infer<typeof GetHomepageImagesRequest>;
  export type Response = ResolvedReturnType<typeof handler>;
}

const GetHomepageImagesRequest = z.object({
  url: z.string(),
  theme: z.union([z.literal("dark"), z.literal("light")]),
});

export async function POST(req: NextRequest) {
  const maybeSessionData = await maybeGetCurrentSession(req);
  if (maybeSessionData.errorResponse != null) {
    return maybeSessionData.errorResponse;
  }
  const { orgId, token } = maybeSessionData.data;

  const parsedBody = await parseNextRequestBody(req, GetHomepageImagesRequest);
  if (parsedBody.errorResponse != null) {
    return parsedBody.errorResponse;
  }
  const { url, theme } = parsedBody.data;

  const ensureOrgOwnsUrlResponse = await ensureOrgOwnsUrl({
    url,
    orgId,
    token,
  });

  if (ensureOrgOwnsUrlResponse.errorResponse != null) {
    return ensureOrgOwnsUrlResponse.errorResponse;
  }

  return NextResponse.json(await handler({ url, theme }));
}
