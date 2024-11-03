import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { CreateResourceOptions, ResourceOp, WarrantOp } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const { organizationId, role } = await withAuth({ ensureSignedIn: true });

    if (!organizationId) {
        return NextResponse.json(
            { error: "unauthorized", error_message: "User is not a member of any organization" },
            { status: 403 },
        );
    }

    if (role !== "admin") {
        return NextResponse.json(
            { error: "unauthorized", error_message: "User is not allowed to trigger a sync operation" },
            { status: 403 },
        );
    }

    const [users, organization] = await Promise.all([
        workos()
            .userManagement.listUsers({ organizationId })
            .then((result) => result.autoPagination()),
        workos().organizations.getOrganization(organizationId),
    ]);

    await workos().fga.batchWriteResources({
        op: ResourceOp.Create,
        resources: [
            {
                resource: {
                    resourceType: "org",
                    resourceId: organization.name,
                },
            },
            ...users.map(
                (user): CreateResourceOptions => ({
                    resource: {
                        resourceType: "user",
                        resourceId: user.email,
                    },
                    meta: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePictureUrl: user.profilePictureUrl,
                    },
                }),
            ),
        ],
    });

    await workos().fga.batchWriteWarrants(
        users.map((user) => ({
            op: WarrantOp.Create,
            resource: {
                resourceType: "org",
                resourceId: organization.name,
            },
            relation: "member",
            subject: {
                resourceType: "user",
                resourceId: user.email,
            },
        })),
    );

    return NextResponse.redirect(new URL(`/${organization.name}/users`, request.url));
}
