import { workos } from "@/workos";
import { Organization, WarrantOp, User as WorkOSUser } from "@workos-inc/node";
import { z } from "zod";

const UserMetaSchema = z.object({
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    profilePictureUrl: z.string().nullable().optional(),
    pendingInvite: z.boolean().nullable().optional(),
});

const UserSchema = UserMetaSchema.extend({
    email: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export async function getMembersOfOrg(org: string): Promise<User[]> {
    const users = await workos()
        .fga.query({ q: `select member of type user for org:${org}` }, { warrantToken: "latest" })
        .then((query) => query.autoPagination());

    return users.map((user) => {
        const meta = UserMetaSchema.safeParse(user.meta);
        if (!meta.success) {
            return { email: user.resourceId };
        }
        return UserSchema.parse({ email: user.resourceId, ...meta.data });
    });
}

export async function getRolesOfOrg(org: string): Promise<string[]> {
    const roles = await workos()
        .fga.query({ q: `select role where org:${org} is parent` }, { warrantToken: "latest" })
        .then((query) => query.autoPagination())
        .then((roles) => roles.filter((role) => role.resourceId.startsWith(`${org}|`)))
        .then((roles) => roles.map((role) => role.resourceId.split("|")[1]));
    return roles;
}

export async function getRolesOfUser(user: string, org: string): Promise<string[]> {
    const roles = await workos()
        .fga.query({ q: `select role where user:${user} is member` }, { warrantToken: "latest" })
        .then((query) => query.autoPagination());
    return roles.filter((role) => role.resourceId.startsWith(`${org}|`)).map((role) => role.resourceId.split("|")[1]);
}

export async function getUsersOfRole(role: string, org: string): Promise<User[]> {
    const users = await workos()
        .fga.query({ q: `select member of type user for role:${org}|${role}` }, { warrantToken: "latest" })
        .then((query) => query.autoPagination());
    return users.map((user) => {
        const meta = UserMetaSchema.safeParse(user.meta);
        if (!meta.success) {
            return { email: user.resourceId };
        }
        return UserSchema.parse({ email: user.resourceId, ...meta.data });
    });
}

export async function getDomainOfOrganizationId(organizationId: string | undefined): Promise<string | undefined> {
    if (!organizationId) {
        return undefined;
    }

    return (await workos().organizations.getOrganization(organizationId)).domains[0]?.domain;
}

interface PendingInvite {
    email: string;
}

export async function getPendingInvitesOfOrg(org: string): Promise<PendingInvite[]> {
    const organizations = await workos()
        .organizations.listOrganizations()
        .then((result) => result.autoPagination());
    const organization = organizations.find((organization) => organization.name === org);
    if (!organization) {
        return [];
    }

    const invites = await workos()
        .userManagement.listInvitations({ organizationId: organization.id })
        .then((result) => result.autoPagination());

    return invites.filter((invite) => invite.state === "pending").map((invite) => ({ email: invite.email }));
}

export async function getWorkosUserByEmail(email: string): Promise<WorkOSUser | undefined> {
    const result = await workos().userManagement.listUsers({ email });
    const users = await result.autoPagination();
    return users[0];
}

export async function getWorkosOrganizationByName(name: string): Promise<Organization | undefined> {
    const result = await workos().organizations.listOrganizations();
    const organizations = await result.autoPagination();
    return organizations.find((org) => org.name === name);
}

export async function deleteUserFromOrg(email: string, org: string): Promise<void> {
    const client = workos();
    await client.fga.writeWarrant({
        op: WarrantOp.Delete,
        resource: { resourceType: "org", resourceId: org },
        relation: "member",
        subject: { resourceType: "user", resourceId: email },
    });
}
