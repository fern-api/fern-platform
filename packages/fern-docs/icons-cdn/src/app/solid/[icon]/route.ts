import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "fas";
library.add(fas);

export const runtime = "edge";

export async function GET(_req: NextRequest, props: { params: Promise<{ icon: string }> }): Promise<NextResponse> {
  const params = await props.params;
  return svgResponse(prefix, params.icon);
}
