"use server";

import { getWorkosOrganizationByName, getWorkosUserByEmail } from "@/server/dao";
import { isUserAdminOfOrg } from "@/server/fga";
import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

type InviteMemberResponse = { type: "user-added" } | { type: "invite-sent" };

export async function inviteMember(data: { org: string; email: string }): Promise<InviteMemberResponse> {
    const { user } = await withAuth();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const isAdmin = await isUserAdminOfOrg(user.email, data.org);

    if (!isAdmin) {
        throw new Error("Unauthorized");
    }

    const organization = await getWorkosOrganizationByName(data.org);

    if (!organization) {
        throw new Error("Organization not found");
    }

    // Check if the user already exists in WorkOS under the organization
    const foundUser = await getWorkosUserByEmail(data.email);

    if (foundUser) {
        // if user exists, we should check if they are already a member of the organization
        const membership = await workos()
            .userManagement.listOrganizationMemberships({
                userId: foundUser.id,
                organizationId: organization.id,
            })
            .then((result) => result.autoPagination())
            .then((memberships) => memberships[0]);

        if (!membership) {
            // if user is not a member, we should add them to the organization
            await workos().userManagement.createOrganizationMembership({
                userId: foundUser.id,
                organizationId: organization.id,
            });
        } else if (membership.status === "inactive") {
            // if user is inactive, we should reactivate them
            await workos().userManagement.reactivateOrganizationMembership(membership.id);
        }

        await workos().fga.createResource({
            resource: {
                resourceType: "user",
                resourceId: user.email,
            },
            meta: {
                firstName: user.firstName,
                lastName: user.lastName,
                profilePictureUrl: user.profilePictureUrl,
                pendingInvite: false,
            },
        });

        revalidatePath(`/${data.org}/users`);
        return { type: "user-added" };
    }

    const invites = await workos()
        .userManagement.listInvitations({ email: data.email })
        .then((result) => result.autoPagination())
        .then((invites) => invites.filter((invite) => invite.state === "pending"));

    if (invites.length > 0) {
        return { type: "invite-sent" };
    }

    // if the user does not exist, we should create them in WorkOS
    const invitation = await workos().userManagement.sendInvitation({
        email: data.email,
        organizationId: organization.id,
        inviterUserId: user.id,
    });

    if (invitation.state === "pending") {
        await workos().fga.createResource({
            resource: {
                resourceType: "user",
                resourceId: data.email,
            },
            meta: {
                pendingInvite: true,
            },
        });
    }

    revalidatePath(`/${data.org}/users`);
    return { type: "invite-sent" };
}
