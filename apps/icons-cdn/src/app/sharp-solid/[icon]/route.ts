import { library } from "@fortawesome/fontawesome-svg-core";
import { fass } from "@fortawesome/sharp-solid-svg-icons";
import { NextRequest, NextResponse } from "next/server";
import { svgResponse } from "../../../svgResponse";

const prefix = "fass";
library.add(fass);

export const runtime = "edge";

export async function GET(_req: NextRequest, { params }: { params: { icon: string } }): Promise<NextResponse> {
    return svgResponse(prefix, params.icon);
}
