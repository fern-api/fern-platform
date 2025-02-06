import { createGetAuthStateEdge } from "@/server/auth/getAuthStateEdge";
import { loadWithUrl } from "@/server/loadWithUrl";
import { provideRegistryService } from "@/server/registry";
import { getInkeepSettings } from "@fern-docs/edge-config";
import { SearchConfig, getSearchConfig } from "@fern-docs/search-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest
): Promise<NextResponse<SearchConfig>> {
  const { getAuthState, domain } = await createGetAuthStateEdge(req);
  const authState = await getAuthState();

  if (!authState.ok) {
    return NextResponse.json(
      { isAvailable: false },
      { status: authState.authed ? 403 : 401 }
    );
  }

  const docs = await loadWithUrl(domain);

  if (!docs.ok) {
    return NextResponse.json({ isAvailable: false }, { status: 503 });
  }

  const inkeepSettings = await getInkeepSettings(domain);
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
