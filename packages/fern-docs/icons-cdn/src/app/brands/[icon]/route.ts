import { NextRequest, NextResponse } from "next/server";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

import { svgResponse } from "../../../svgResponse";

const prefix = "fab";
library.add(fab);

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ icon: string }> }
): Promise<NextResponse> {
  const params = await props.params;
  return svgResponse(prefix, params.icon);
}
