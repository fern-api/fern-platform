import { library } from "@fortawesome/fontawesome-svg-core";
import { fasr } from "@fortawesome/sharp-regular-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "fasr";
library.add(fasr);

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: { icon: string } }
): Promise<NextResponse> {
  return svgResponse(prefix, params.icon);
}
