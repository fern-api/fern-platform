"use server";

import { getUsersOfRole } from "@/server/dao";

export async function RoleSummary({ role, org }: { role: string; org: string }): Promise<React.ReactElement> {
    const users = await getUsersOfRole(role, org);

    return (
        <div>
            <p className="text-sm font-medium leading-none">
                <code>{role}</code>
            </p>
            <p className="text-sm text-muted-foreground">{users.length} users</p>
        </div>
    );
}
