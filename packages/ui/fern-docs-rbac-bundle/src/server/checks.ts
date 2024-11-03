import { workos } from "@/workos";
import { User } from "@workos-inc/node";

export async function isUserAdminOfWorkOSOrg(user: User, organizationId: string): Promise<boolean> {
    const adminMembership = await workos()
        .userManagement.listOrganizationMemberships({
            userId: user.id,
            organizationId,
        })
        .then((result) => result.autoPagination())
        .then((results) => results.find((membership) => membership.role.slug === "admin"));

    return adminMembership != null;
}
