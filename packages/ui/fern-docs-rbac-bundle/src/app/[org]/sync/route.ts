import { isUserAdminOfWorkOSOrg } from "@/server/checks";
import { getWorkosOrganizationByName } from "@/server/dao";
import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { CreateResourceOptions, ResourceOp, WarrantOp } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ org: string }> },
): Promise<NextResponse> {
    const { org } = await params;
    const { user } = await withAuth({ ensureSignedIn: true });

    const organization = await getWorkosOrganizationByName(org);
    if (!organization) {
        return new NextResponse(null, { status: 404 });
    }

    if (!(await isUserAdminOfWorkOSOrg(user, organization.id))) {
        return new NextResponse(null, { status: 403 });
    }

    const users = await workos()
        .userManagement.listUsers({ organizationId: organization.id })
        .then((result) => result.autoPagination());

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
