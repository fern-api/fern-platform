"use server";

import { isUserAdminOfOrg } from "@/server/fga";
import { workos } from "@/workos";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

const ROLE_REGEX = /^[a-zA-Z0-9_-]+$/;

const validateRole = (role: string) => {
    return ROLE_REGEX.test(role);
};

export async function createRole(data: { org: string; role: string }): Promise<void> {
    const { user } = await withAuth({ ensureSignedIn: true });

    const { org, role } = data;

    if (!validateRole(role)) {
        throw new Error("Invalid role");
    }

    if (!(await isUserAdminOfOrg(user.email, org))) {
        throw new Error("Not admin");
    }

    const resource = await workos.fga.createResource({
        resource: { resourceType: "role", resourceId: `${org}|${role}` },
    });

    await workos.fga.writeWarrant({
        resource,
        relation: "parent",
        subject: { resourceType: "org", resourceId: org },
    });

    revalidatePath(`/${org}/roles`, "page");
}
