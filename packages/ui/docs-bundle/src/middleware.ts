import { rewritePosthog } from "./utils/rewritePosthog";

export function middleware(request: NextRequest): NextResponse {
    if (request.nextUrl.pathname.includes("/api/fern-docs/analytics/posthog")) {
        return rewritePosthog(request);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/api/fern-docs/analytics/posthog/:path*", "/:prefix*/api/fern-docs/analytics/posthog/:path*"],
};
