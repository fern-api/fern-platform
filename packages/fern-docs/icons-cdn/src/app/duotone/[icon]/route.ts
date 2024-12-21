import { library } from "@fortawesome/fontawesome-svg-core";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "fad";
library.add(fad);

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: { icon: string } }
): Promise<NextResponse> {
  return svgResponse(prefix, params.icon);
}
