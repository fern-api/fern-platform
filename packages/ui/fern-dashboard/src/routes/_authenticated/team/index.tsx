import { getAPIResponse } from "@/services/fern";
import { getVenusClient } from "@/services/venus";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/team/")({
    component: () => <Outlet />,
    beforeLoad: async ({ context }) => {
        if (!context.auth) {
            throw new Error("Auth0 context not found.");
        }

        if (context.auth.isLoading) {
            console.debug("Auth0 is still loading, waiting...");
            return;
        }
        if (context.auth.error) {
            throw context.auth.error;
        }

        if (!context.auth.isAuthenticated) {
            console.debug("User is not authenticated, redirecting to /login");
            await context.auth.loginWithRedirect();
        }

        const orgIds = context.orgIds;
        let orgId: string;

        // Technically could just assert that orgIds is non-null, but
        // it's better to be safe than sorry
        if (!orgIds || orgIds.length === 0) {
            const token = await context.auth.getAccessTokenSilently();
            console.log("token", token);
            const client = getVenusClient({ token });
            const fetchedIds = getAPIResponse(await client.organization.getOrgIdsFromToken());
            if (!fetchedIds || fetchedIds.length === 0) {
                throw new Error("No organizations found");
            }
            orgId = fetchedIds?.[0];
        } else {
            orgId = orgIds[0];
        }
        throw redirect({ to: "/team/$orgId", params: { orgId } });
    },
});
