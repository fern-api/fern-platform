import { FernLogo } from "@/components/FernLogo";
import { useAuth0 } from "@auth0/auth0-react";
import { FernButton, RemoteFontAwesomeIcon, toast } from "@fern-ui/components";
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
        <div className="h-full w-full text-center items-center content-center overflow-hidden bg-background">
            <div className="flex flex-col w-[60%] max-h-[75%] h-fit bg-foreground text-white rounded-2xl m-auto pt-8 px-8">
                <div className="flex flex-col w-[30%] gap-y-10 self-center">
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
                        className="!bg-white !hover:bg-white/20 w-fit border border-gray-300 !shadow-[0px_0px_15px_0px_#1EA32A] self-center"
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
                    <div className="pointer-events-none relative overflow-hidden bottom-0">
                        <div className="aspect-[6/1.75] z-100" />
                        <FernLogo className="absolute fill-background -bottom-5 z-0" />
                    </div>
                </div>
            </div>
        </div>
    );
};
