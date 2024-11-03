"use server";

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

    const organizations = await workos()
        .organizations.listOrganizations()
        .then((result) => result.autoPagination());

    const organizationId = organizations.find((org) => org.name === data.org)?.id;

    if (!organizationId) {
        throw new Error("Organization not found");
    }

    // Check if the user already exists in WorkOS under the organization
    const foundUser = await workos()
        .userManagement.listUsers({ email: data.email })
        .then((result) => result.autoPagination())
        .then((users) => users.filter((user) => user.email === data.email)[0]);

    if (foundUser) {
        // if user exists, we should check if they are already a member of the organization
        const memberships = await workos()
            .userManagement.listOrganizationMemberships({
                userId: foundUser.id,
            })
            .then((result) => result.autoPagination());

        const isMember = memberships.find((membership) => membership.organizationId === organizationId);

        if (!isMember) {
            // if user is not a member, we should add them to the organization
            await workos().userManagement.createOrganizationMembership({
                userId: foundUser.id,
                organizationId,
            });
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
        organizationId,
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

    return { type: "invite-sent" };
}
