import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export function GET(req: NextRequest) {
  const host = req.nextUrl.host;
  const domain = getDocsDomainEdge(req);
  const pathname = req.nextUrl.searchParams.get("path");
  if (pathname == null) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  revalidatePath(`/${host}/${domain}/static/${slugjoin(pathname)}`);
  return NextResponse.json({ success: true });
}
