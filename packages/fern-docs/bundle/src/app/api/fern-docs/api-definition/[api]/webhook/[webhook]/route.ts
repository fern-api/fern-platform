import { getAuthStateEdge } from "@/server/auth/getAuthStateEdge";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { ApiDefinitionLoader } from "@fern-docs/cache";
import { getFeatureFlags } from "@fern-docs/edge-config";
import { getMdxBundler } from "@fern-docs/ui/bundlers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { api: string; webhook: string } }
): Promise<NextResponse> {
  const { api, webhook } = params;

  const authState = await getAuthStateEdge(req);

  if (!authState.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: authState.authed ? 403 : 401 }
    );
  }

  const flags = await getFeatureFlags(authState.domain);
  const engine = flags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
  const serializeMdx = await getMdxBundler(engine);

  const apiDefinition = await ApiDefinitionLoader.create(
    authState.domain,
    ApiDefinition.ApiDefinitionId(api)
  )
    .withFlags(flags)
    .withMdxBundler(serializeMdx, engine)
    .withPrune({
      type: "webhook",
      webhookId: ApiDefinition.WebhookId(webhook),
    })
    .withResolveDescriptions()
    .withEnvironment(process.env.NEXT_PUBLIC_FDR_ORIGIN)
    .load();

  if (!apiDefinition) {
    return NextResponse.json(
      { error: "API Definition not found" },
      { status: 404 }
    );
  }

  const response = NextResponse.json(apiDefinition, { status: 200 });
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  return response;
}
