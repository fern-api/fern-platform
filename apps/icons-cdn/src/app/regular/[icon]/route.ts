import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "far";
library.add(far);

export const runtime = "edge";

export async function GET(_req: NextRequest, { params }: { params: { icon: string } }): Promise<NextResponse> {
    return svgResponse(prefix, params.icon);
}
