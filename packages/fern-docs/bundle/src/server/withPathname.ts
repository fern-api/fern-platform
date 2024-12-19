import { NextRequest } from "next/server";

export function withPathname(
    request: NextRequest,
    pathname: string,
    search?: string
): string {
    return `${request.nextUrl.origin}${pathname}${search ?? request.nextUrl.search}`;
}
