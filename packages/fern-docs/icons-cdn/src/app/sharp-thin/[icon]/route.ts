import { library } from "@fortawesome/fontawesome-svg-core";
import { fast } from "@fortawesome/sharp-thin-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "fast";
library.add(fast);

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: { icon: string } }
): Promise<NextResponse> {
  return svgResponse(prefix, params.icon);
}
