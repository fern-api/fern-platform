"use server";

import { isUserAdminOfOrg } from "@/server/fga";
import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { WarrantOp } from "@workos-inc/node";
import { revalidatePath } from "next/cache";

export async function createUserRole(email: string, org: string, role: string): Promise<void> {
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!(await isUserAdminOfOrg(user.email, org))) {
        throw new Error("Unauthorized");
    }

    await workos.fga.writeWarrant({
        op: WarrantOp.Create,
        resource: { resourceType: "role", resourceId: `${org}|${role}` },
        relation: "member",
        subject: { resourceType: "user", resourceId: email },
    });

    revalidatePath(`/${org}/roles`, "page");
    revalidatePath(`/${org}/users`, "page");
}
