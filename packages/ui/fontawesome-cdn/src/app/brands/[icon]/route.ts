import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "fab";
library.add(fab);

export const runtime = "edge";

export async function GET(_req: NextRequest, { params }: { params: { icon: string } }): Promise<NextResponse> {
    return svgResponse(prefix, params.icon);
}
