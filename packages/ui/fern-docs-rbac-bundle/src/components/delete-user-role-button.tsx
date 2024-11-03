"use client";

import { deleteUserRole } from "@/actions/delete-user-role";
import { SubmitButton } from "@/components/ui/submit-button";

export default function DeleteUserRoleButton({
    email,
    org,
    role,
}: {
    email: string;
    org: string;
    role: string;
}): React.ReactElement {
    return (
        <form action={deleteUserRole.bind(null, email, org, role)}>
            <SubmitButton variant="destructive">Remove</SubmitButton>
        </form>
    );
}
