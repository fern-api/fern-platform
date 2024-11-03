import { workos } from "@/workos";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// TODO: this endpoint should be gated by a shared secret between the client and server
// for now, we'll keep this open
export async function GET(request: NextRequest): Promise<NextResponse> {
    const org = request.nextUrl.searchParams.get("org");
    const email = request.nextUrl.searchParams.get("email");

    if (!org || !email) {
        return new NextResponse(null, { status: 400 });
    }

    // Lists all the roles that this user is a member of
    const roles = await workos.fga
        .listWarrants({
            resourceType: "role",
            relation: "member",
            subjectType: "user",
            subjectId: email,
        })
        .then((result) => result.autoPagination())
        .then((results) => results.filter((r) => r.resourceId.startsWith(`${org}|`)));

    return NextResponse.json(roles.map((r) => r.resourceId.split("|")[1]));
}
