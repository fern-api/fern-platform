"use server";

import { InlineCode } from "@/components/typography/inline-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getRolesOfOrg } from "@/server/dao";
import { isUserAdminOfOrg } from "@/server/fga";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { notFound } from "next/navigation";
import { CreateRoleForm } from "../../../components/create-role-form";
import DeleteRole from "../../../components/delete-role-button";
import { RoleSummary } from "../../../components/role-summary";
import { UsersForRoleList } from "../../../components/users-for-role-list";

export default async function RolesPage({ params }: { params: Promise<{ org: string }> }): Promise<React.ReactElement> {
    const { user } = await withAuth({ ensureSignedIn: true });
    const { org } = await params;

    if (!(await isUserAdminOfOrg(user.email, org))) {
        notFound();
    }

    const roles = await getRolesOfOrg(org);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Manage RBAC for your docs.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {roles.map((role) => (
                    <div className="flex items-center justify-between gap-4" key={role}>
                        <RoleSummary role={role} org={org} />
                        <div className="flex items-center gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Manage users</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Manage users for <InlineCode>{role}</InlineCode>
                                        </DialogTitle>
                                    </DialogHeader>
                                    <UsersForRoleList role={role} org={org} />
                                </DialogContent>
                            </Dialog>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <DotsHorizontalIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-fit min-w-[200px]">
                                    <DeleteRole role={role} org={org} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                ))}
                <CreateRoleForm org={org} />
            </CardContent>
        </Card>
    );
}
