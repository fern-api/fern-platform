import { getAPIResponse } from "@/services/fern";
import { getVenusClient } from "@/services/venus";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
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
        const token = await context.auth.getAccessTokenSilently();
        let fetchedIds: string[] | undefined = undefined;

        const venusClient = context.venusClient ?? getVenusClient({ token });

        if (!orgIds || orgIds.length === 0) {
            fetchedIds = getAPIResponse(await venusClient.organization.getOrgIdsFromToken());
        }
        return {
            ...context,
            venusClient,
            orgIds: fetchedIds ?? orgIds,
        };
    },
});
