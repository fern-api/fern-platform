import { buildUrl } from "@fern-ui/fdr-utils";
import type { NextRequest } from "next/server";
import type { NextApiRequest } from "next/types";
import { toValidPathname } from "./toValidPathname";

export function buildUrlFromApiEdge(xFernHost: string, req: NextRequest): string {
    const maybePathName = req.nextUrl.pathname.split("/api/fern-docs")[0] ?? "";
    return buildUrl({
        host: xFernHost,
        pathname: toValidPathname(maybePathName),
    });
}

export function buildUrlFromApiNode(xFernHost: string, req: NextApiRequest): string {
    const maybePathName = req.url?.split("/api/fern-docs")[0] ?? "";
    return buildUrl({
        host: xFernHost,
        pathname: toValidPathname(maybePathName),
    });
}
