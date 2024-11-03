"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function OrgTabs(): React.ReactElement {
    const { org } = useParams();
    const pathname = usePathname();
    const value = pathname.split("/")[2] ?? "users";

    return (
        <Tabs value={value} className="w-[500px]" asChild>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users" asChild>
                    <Link href={`/${org}/users`}>Users</Link>
                </TabsTrigger>
                <TabsTrigger value="roles" asChild>
                    <Link href={`/${org}/roles`}>Roles</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
