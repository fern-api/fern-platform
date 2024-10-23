import { NextRequest } from "next/server";

export function withPathname(request: NextRequest, pathname: string): string {
    return `${request.nextUrl.origin}${pathname}${request.nextUrl.search}`;
}
