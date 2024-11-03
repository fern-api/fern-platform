"use server";

import { Button } from "@/components/ui/button";
import { User, getRolesOfUser } from "@/server/dao";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { UserRolePopover } from "./user-role-popover";

export async function UserRoleButton({
    org,
    user,
    roles,
}: {
    org: string;
    user: User;
    roles: string[];
}): Promise<React.ReactElement | false> {
    const userRoles = await getRolesOfUser(user.email, org);

    return (
        <UserRolePopover org={org} user={user} roles={roles} userRoles={userRoles}>
            <Button variant="outline" className="ml-auto">
                {userRoles.length > 0 ? (
                    <p>
                        {userRoles[0]} {userRoles.length > 1 ? `(+${userRoles.length - 1})` : ""}
                    </p>
                ) : (
                    <p className="text-muted-foreground italic">No roles</p>
                )}
                <ChevronDownIcon className="ml-2 size-4 text-muted-foreground" />
            </Button>
        </UserRolePopover>
    );
}
