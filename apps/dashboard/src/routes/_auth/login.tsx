import { useAuth0 } from "@auth0/auth0-react";
import { FernButton, FernLogo, FernLogoFill, RemoteFontAwesomeIcon, toast } from "@fern-ui/components";
import { createFileRoute } from "@tanstack/react-router";

import { z } from "zod";

// We try to leverage auth0's loginWithRedirect method to redirect the user to the login page
// but since it has some papercuts and needs error handling, we're making a custom login page
// to handle errors and allow users to reattempt logging in.
export const maybeOrganizationSearchSchema = z.object({
    invitation: z.optional(z.string()),
    organization: z.optional(z.string()),
    organization_name: z.optional(z.string()),
});

export const Route = createFileRoute("/_auth/login")({
    component: () => <Login />,
    validateSearch: maybeOrganizationSearchSchema,
});

const Login: React.FC = () => {
    const auth = useAuth0();

    const { invitation, organization, organization_name } = Route.useSearch();
    // When redirected to from the invite email, for some reason we have to re-envoke loginWithRedirect
    // https://github.com/auth0/auth0-react/blob/main/EXAMPLES.md#use-with-auth0-organizations
    if (invitation && organization && organization_name) {
        auth.loginWithRedirect({
            authorizationParams: {
                organization,
                invitation,
                connection: "github",
            },
        });
    } else if (invitation != null || organization != null || organization_name != null) {
        toast.error("The invite you received looks invalid! Try requesting another or contacting support.", {
            id: "bad-invite",
        });
    }

    return (
        <div className="bg-background h-full w-full content-center items-center overflow-hidden text-center">
            <div className="bg-foreground m-auto flex h-fit max-h-[75%] w-[60%] flex-col rounded-2xl px-8 pt-8 text-white">
                <div className="flex w-[30%] flex-col gap-y-10 self-center">
                    <h2 className="text-muted">Log in to manage your APIs.</h2>
                    <FernButton
                        onClick={() => auth.loginWithRedirect()}
                        icon={
                            <RemoteFontAwesomeIcon
                                icon="fa-brands fa-github"
                                lightModeColor="black"
                                darkModeColor="black"
                            />
                        }
                        className="!hover:bg-white/20 w-fit self-center border border-gray-300 !bg-white !shadow-[0px_0px_15px_0px_#1EA32A]"
                        full={false}
                    >
                        Continue with GitHub
                    </FernButton>
                </div>

                <div>
                    <div className="mt-40">
                        <span className="text-muted">Input OpenAPI. Output SDKs and Docs.</span>
                        <h1 className="text-white">Welcome to</h1>
                    </div>
                    <div className="pointer-events-none relative bottom-0 overflow-hidden">
                        <div className="z-100 aspect-[6/1.75]" />
                        <FernLogo className="absolute -bottom-5 z-0" fill={FernLogoFill.Air} />
                    </div>
                </div>
            </div>
        </div>
    );
};
