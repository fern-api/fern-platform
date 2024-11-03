"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "@/server/dao";
import { PropsWithChildren, useState } from "react";
import { UpdateUserRolesForm } from "./update-user-roles-form";

export function UserRolePopover({
    org,
    user,
    roles,
    userRoles,
    children,
}: PropsWithChildren<{
    org: string;
    user: User;
    roles: string[];
    userRoles: string[];
}>): React.ReactElement {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="p-4 flex flex-col gap-2 w-fit min-w-[200px]" align="end">
                <UpdateUserRolesForm
                    userDisplayName={`${user.firstName} ${user.lastName}`}
                    email={user.email}
                    org={org}
                    selectedRoles={userRoles}
                    roles={roles}
                    onClose={() => setIsOpen(false)}
                />
            </PopoverContent>
        </Popover>
    );
}
