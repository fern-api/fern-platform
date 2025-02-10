import { NextRequest, NextResponse } from "next/server";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fat } from "@fortawesome/pro-thin-svg-icons";

import { svgResponse } from "../../../svgResponse";

const prefix = "fat";
library.add(fat);

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ icon: string }> }
): Promise<NextResponse> {
  const params = await props.params;
  return svgResponse(prefix, params.icon);
}
