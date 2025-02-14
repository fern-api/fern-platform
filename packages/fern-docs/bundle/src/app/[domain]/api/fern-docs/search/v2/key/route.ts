import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import {
  DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
  SEARCH_INDEX,
  getSearchApiKey,
} from "@fern-docs/search-server/algolia/edge";
import { COOKIE_FERN_TOKEN, withoutStaging } from "@fern-docs/utils";

import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { algoliaAppId, algoliaSearchApikey } from "@/server/env-variables";
import { getDocsUrlMetadata } from "@/server/getDocsUrlMetadata";
import { selectFirst } from "@/server/utils/selectFirst";

export const runtime = "edge";
export const maxDuration = 10;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
): Promise<NextResponse> {
  const { domain } = await params;

  const metadata = await getDocsUrlMetadata(domain);
  if (metadata.isPreview) {
    return NextResponse.json("Search is not supported for preview URLs", {
      status: 400,
    });
  }

  const fern_token = (await cookies()).get(COOKIE_FERN_TOKEN)?.value;
  const user = await safeVerifyFernJWTConfig(
    fern_token,
    await getAuthEdgeConfig(domain)
  );

  const userToken = getXUserToken(req) ?? user?.api_key ?? fern_token;

  const apiKey = await getSearchApiKey({
    parentApiKey: algoliaSearchApikey(),
    domain: withoutStaging(domain),
    roles: user?.roles ?? [],
    authed: user != null,
    expiresInSeconds: DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
    searchIndex: SEARCH_INDEX,
    userToken,
  });

  return NextResponse.json(
    {
      appId: algoliaAppId(),
      apiKey,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

function getXUserToken(req: NextRequest): string | undefined {
  return selectFirst(req.headers.get("X-User-Token"));
}
