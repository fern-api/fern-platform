"use server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { getDomainOfOrganizationId, getMembersOfOrg, getRolesOfOrg } from "@/server/dao";
import { isUserAdminOfOrg } from "@/server/fga";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { notFound } from "next/navigation";
import { InviteUsersForm } from "../components/invite-users-form";
import { RevokeInviteButton } from "../components/revoke-invite-button";
import { UserRoleButton } from "../components/user-role-button";
import { UserSummary } from "../components/user-summary";

export default async function UsersPage({ params }: { params: Promise<{ org: string }> }): Promise<React.ReactElement> {
    const { org } = await params;
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });

    if (!(await isUserAdminOfOrg(user.email, org))) {
        notFound();
    }

    const [users, roles, domain] = await Promise.all([
        getMembersOfOrg(org),
        getRolesOfOrg(org),
        getDomainOfOrganizationId(organizationId),
    ]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Invite users to view your docs.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {users.map((user) => (
                    <div className="flex items-center justify-between space-x-4" key={user.email}>
                        <UserSummary user={user} />
                        <div className="flex items-center space-x-2">
                            <UserRoleButton org={org} user={user} roles={roles} />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <DotsHorizontalIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-fit min-w-[200px]">
                                    <RevokeInviteButton
                                        email={user.email}
                                        org={org}
                                        pendingInvite={user.pendingInvite}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                ))}
                <InviteUsersForm org={org} domain={domain} />
            </CardContent>
        </Card>
    );
}
