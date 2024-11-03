"use server";

import { Separator } from "@/components/ui/separator";
import { getMembersOfOrg, getUsersOfRole } from "@/server/dao";
import CreateUserRoleButton from "./create-user-role-button";
import DeleteUserRoleButton from "./delete-user-role-button";
import { UserSummary } from "./user-summary";

export async function UsersForRoleList({ role, org }: { role: string; org: string }): Promise<React.ReactElement> {
    const [usersInRole, allUsers] = await Promise.all([getUsersOfRole(role, org), getMembersOfOrg(org)]);

    const usersInRoleSet = new Set(usersInRole.map((user) => user.email));

    const usersNotInRole = allUsers.filter((user) => !usersInRoleSet.has(user.email));

    return (
        <div className="grid gap-6 py-6">
            {usersInRole.map((user) => (
                <div key={user.email} className="flex items-center justify-between space-x-4">
                    <UserSummary user={user} />
                    <DeleteUserRoleButton email={user.email} org={org} role={role} />
                </div>
            ))}
            {usersInRole.length > 0 && usersNotInRole.length > 0 && <Separator />}
            {usersNotInRole.map((user) => (
                <div key={user.email} className="flex items-center justify-between space-x-4">
                    <UserSummary user={user} />
                    <CreateUserRoleButton email={user.email} org={org} role={role} />
                </div>
            ))}
        </div>
    );
}
