"use client";

import { deleteRole } from "@/actions/delete-role";
import { SubmitButton } from "@/components/ui/submit-button";

export default function DeleteRole({ org, role }: { org: string; role: string }): React.ReactElement {
    return (
        <form action={deleteRole.bind(null, org, role)}>
            <SubmitButton variant="destructive" className="w-full">
                Delete Role
            </SubmitButton>
        </form>
    );
}
