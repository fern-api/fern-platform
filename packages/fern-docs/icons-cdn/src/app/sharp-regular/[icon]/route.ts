import { NextRequest, NextResponse } from "next/server";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fasr } from "@fortawesome/sharp-regular-svg-icons";

import { svgResponse } from "../../../svgResponse";

const prefix = "fasr";
library.add(fasr);

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ icon: string }> }
): Promise<NextResponse> {
  const params = await props.params;
  return svgResponse(prefix, params.icon);
}
