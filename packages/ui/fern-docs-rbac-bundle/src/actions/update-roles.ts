"use server";

import { getRolesOfUser } from "@/server/dao";
import { isUserAdminOfOrg } from "@/server/fga";
import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { WarrantOp, WriteWarrantOptions } from "@workos-inc/node";
import { revalidatePath } from "next/cache";

export async function updateRoles(data: { email: string; org: string; roles: string[] }): Promise<void> {
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!(await isUserAdminOfOrg(user.email, data.org))) {
        throw new Error("Unauthorized");
    }

    const currentRoles = await getRolesOfUser(data.email, data.org);

    const rolesToCreate = data.roles.filter((role) => !currentRoles.includes(role));
    const rolesToDelete = currentRoles.filter((role) => !data.roles.includes(role));

    const warrants = [
        ...rolesToCreate.map(
            (role): WriteWarrantOptions => ({
                op: WarrantOp.Create,
                resource: { resourceType: "role", resourceId: `${data.org}|${role}` },
                relation: "member",
                subject: { resourceType: "user", resourceId: data.email },
            }),
        ),
        ...rolesToDelete.map(
            (role): WriteWarrantOptions => ({
                op: WarrantOp.Delete,
                resource: { resourceType: "role", resourceId: `${data.org}|${role}` },
                relation: "member",
                subject: { resourceType: "user", resourceId: data.email },
            }),
        ),
    ];

    if (warrants.length === 0) {
        return;
    }

    await workos().fga.batchWriteWarrants(warrants);

    revalidatePath(`/${data.org}/users`, "page");
    revalidatePath(`/${data.org}/roles`, "page");
    revalidatePath(`/${data.org}/users/${data.email}/roles`);
}
