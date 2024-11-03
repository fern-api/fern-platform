"use client";

import { createUserRole } from "@/actions/create-user-role";
import { SubmitButton } from "@/components/ui/submit-button";

export default function CreateUserRoleButton({
    email,
    org,
    role,
}: {
    email: string;
    org: string;
    role: string;
}): React.ReactElement {
    return (
        <form action={createUserRole.bind(null, email, org, role)}>
            <SubmitButton>Add</SubmitButton>
        </form>
    );
}
