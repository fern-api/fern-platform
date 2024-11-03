"use server";

import { isUserAdminOfOrg } from "@/server/fga";
import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

export async function deleteRole(org: string, role: string): Promise<void> {
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!(await isUserAdminOfOrg(user.email, org))) {
        return;
    }

    await workos().fga.deleteResource({ resourceId: `${org}|${role}`, resourceType: "role" });

    revalidatePath(`/${org}/roles`, "page");
    revalidatePath(`/${org}/users`, "page");
}
