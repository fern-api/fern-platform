import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import {
  algoliaAppId,
  algoliaSearchApikey,
  fernToken,
} from "@/server/env-variables";
import { selectFirst } from "@/server/utils/selectFirst";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import {
  DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
  SEARCH_INDEX,
  getSearchApiKey,
} from "@fern-docs/search-server/algolia/edge";
import { withoutStaging } from "@fern-docs/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);

  const orgMetadata = await getOrgMetadataForDomain(withoutStaging(domain));
  if (orgMetadata == null) {
    return NextResponse.json("Not found", { status: 404 });
  }

  if (orgMetadata.isPreviewUrl) {
    return NextResponse.json("Search is not supported for preview URLs", {
      status: 400,
    });
  }

  const fern_token = await fernToken();
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
