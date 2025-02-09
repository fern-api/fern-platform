import { library } from "@fortawesome/fontawesome-svg-core";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "fal";
library.add(fal);

export const runtime = "edge";

export async function GET(_req: NextRequest, props: { params: Promise<{ icon: string }> }): Promise<NextResponse> {
  const params = await props.params;
  return svgResponse(prefix, params.icon);
}
