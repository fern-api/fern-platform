import { signOut } from "@workos-inc/authkit-nextjs";
import { SubmitButton } from "./ui/submit-button";

export default async function SignOutButton(): Promise<React.ReactElement> {
    return (
        <form
            action={async () => {
                "use server";
                await signOut();
            }}
        >
            <SubmitButton variant="ghost">Sign out</SubmitButton>
        </form>
    );
}
