"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/server/dao";

export function UserSummary({ user }: { user: User }): React.ReactElement {
    return (
        <div className="flex items-center space-x-4">
            <Avatar>
                <AvatarImage src={user.profilePictureUrl ?? undefined} />
                <AvatarFallback>
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div>
                {user.firstName && user.lastName && (
                    <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                    </p>
                )}
                <p className="text-sm text-muted-foreground">
                    {user.email}
                    {user.pendingInvite && <span className="ms-1">(invited)</span>}
                </p>
            </div>
        </div>
    );
}
