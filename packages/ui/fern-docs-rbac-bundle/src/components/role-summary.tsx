"use server";

import { getUsersOfRole } from "@/server/dao";
import { InlineCode } from "./typography/inline-code";

export async function RoleSummary({ role, org }: { role: string; org: string }): Promise<React.ReactElement> {
    const users = await getUsersOfRole(role, org);

    return (
        <div>
            <p className="text-sm font-medium leading-none">
                <InlineCode>{role}</InlineCode>
                <span className="text-sm text-muted-foreground ms-1">({users.length} users)</span>
            </p>
        </div>
    );
}
