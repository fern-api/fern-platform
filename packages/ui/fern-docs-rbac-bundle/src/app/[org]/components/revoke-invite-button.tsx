import { removeUserFromOrg } from "@/actions/remove-user";
import { SubmitButton } from "@/components/ui/submit-button";

export function RevokeInviteButton({
    email,
    org,
    pendingInvite = false,
}: {
    email: string;
    org: string;
    pendingInvite?: boolean | null;
}): React.ReactElement {
    return (
        <form action={removeUserFromOrg.bind(null, email, org)}>
            <SubmitButton variant="destructive" className="w-full">
                {pendingInvite ? "Revoke invite" : "Remove user"}
            </SubmitButton>
        </form>
    );
}
