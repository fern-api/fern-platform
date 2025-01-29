import { getAuthStateEdge } from "@/server/auth/getAuthStateEdge";
import { loadWithUrl } from "@/server/loadWithUrl";
import { getInkeepSettings } from "@fern-docs/edge-config";
import { SearchConfig, getSearchConfig } from "@fern-docs/search-utils";
import { provideRegistryService } from "@fern-docs/ui";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest
): Promise<NextResponse<SearchConfig>> {
  const authState = await getAuthStateEdge(req, req.nextUrl.pathname);

  if (!authState.ok) {
    return NextResponse.json(
      { isAvailable: false },
      { status: authState.authed ? 403 : 401 }
    );
  }

  const docs = await loadWithUrl(authState.domain);

  if (!docs.ok) {
    return NextResponse.json({ isAvailable: false }, { status: 503 });
  }

  const inkeepSettings = await getInkeepSettings(authState.domain);
  const searchInfo = docs.body.definition.search;
  const config = await getSearchConfig(
    provideRegistryService(),
    searchInfo,
    inkeepSettings
  );

  return NextResponse.json(config, {
    status: config.isAvailable ? 200 : 503,
  });
}
