import { NextRequest, NextResponse } from "next/server";
import { getHostEdge } from "./xfernhost/edge";

export class FernNextResponse {
    public static redirect(
        req: NextRequest,
        {
            destination,
            allowedDestinations,
        }: {
            destination?: string | URL;
            allowedDestinations?: string[];
        },
        init?: ResponseInit,
    ): NextResponse {
        if (typeof destination === "undefined") {
            return NextResponse.next();
        }

        const allowedDomains = [getHostEdge(req), ...(allowedDestinations ?? []).map((url) => new URL(url).host)];
        const redirectLocation = new URL(destination);

        if (!allowedDomains.includes(redirectLocation.host) && !isBuildWithFern(redirectLocation.host)) {
            // open redirect to unknown host detected:
            return new NextResponse(null, { status: 410 });
        }

        return NextResponse.redirect(redirectLocation, init);
    }
}

function isBuildWithFern(host: string): boolean {
    return (
        host.toLowerCase().endsWith(".buildwithfern.com") ||
        host.toLowerCase().endsWith(".buildwithfern.dev") ||
        host.toLowerCase().endsWith(".ferndocs.app") ||
        host.toLowerCase().endsWith(".ferndocs.com") ||
        host.toLowerCase().endsWith(".ferndocs.dev")
    );
}
