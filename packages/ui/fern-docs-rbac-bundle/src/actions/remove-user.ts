"use server";

import { isUserAdminOfWorkOSOrg } from "@/server/checks";
import { isUserAdminOfOrg } from "@/server/fga";
import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { WarrantOp } from "@workos-inc/node";
import { revalidatePath } from "next/cache";

export async function removeUserFromOrg(email: string, org: string): Promise<void> {
    const { user } = await withAuth();

    if (!user) {
        return;
    }

    // ensure that the user is an admin of the FGA org
    if (!(await isUserAdminOfOrg(user.email, org))) {
        return;
    }

    // Delete the user from the org in FGA
    await workos().fga.writeWarrant({
        op: WarrantOp.Delete,
        resource: {
            resourceType: "org",
            resourceId: org,
        },
        relation: "member",
        subject: {
            resourceType: "user",
            resourceId: email,
        },
    });

    // Delete the user from the WorkOS org
    const organization = await workos()
        .organizations.listOrganizations()
        .then((result) => result.autoPagination())
        .then((results) => results.find((organization) => organization.name === org));

    if (!organization) {
        revalidatePath(`/${org}/users`);
        return;
    }

    if (!(await isUserAdminOfWorkOSOrg(user, organization.id))) {
        revalidatePath(`/${org}/users`);
        return;
    }

    await Promise.all([
        deactivateOrganizationMemberships(organization.id, email),
        revokeInvitations(organization.id, email),
    ]);

    revalidatePath(`/${org}/users`);
}

async function deactivateOrganizationMemberships(organizationId: string, email: string): Promise<void> {
    const user = await workos()
        .userManagement.listUsers({ email, organizationId })
        .then((result) => result.autoPagination())
        .then((results) => results.find((user) => user.email === email));

    if (!user) {
        return;
    }

    const memberships = await workos()
        .userManagement.listOrganizationMemberships({ organizationId, userId: user.id, statuses: ["active"] })
        .then((result) => result.autoPagination());

    for (const membership of memberships) {
        await workos().userManagement.deactivateOrganizationMembership(membership.id);
    }
}

async function revokeInvitations(organizationId: string, email: string): Promise<void> {
    const invitations = await workos()
        .userManagement.listInvitations({ email, organizationId })
        .then((result) => result.autoPagination());

    for (const invitation of invitations) {
        if (invitation.state === "pending") {
            await workos().userManagement.revokeInvitation(invitation.id);
        }
    }
}
