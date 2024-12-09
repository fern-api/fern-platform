import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { NextRequest, NextResponse } from "next/server";
import { getDocsDomainEdge } from "./xfernhost/edge";

export class FernNextResponse {
    public static redirect(req: NextRequest, destination?: string): NextResponse {
        if (typeof destination === "undefined") {
            return NextResponse.next();
        }

        const domain = getDocsDomainEdge(req);
        let redirectLocation = new URL(destination);

        // sanitize potentially problematic open redirects
        if (
            new URL(destination).host !== new URL(withDefaultProtocol(domain)).host
        ) {
            redirectLocation = new URL(withDefaultProtocol(domain));
        }

        return NextResponse.redirect(redirectLocation);
    }
}