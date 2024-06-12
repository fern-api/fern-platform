import { getAPIResponse } from "@/services/fern";
import { getVenusClient } from "@/services/venus";
import { checkAuthAndThrow } from "@/utils";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
    component: () => <Outlet />,
    beforeLoad: async ({ context }) => {
        const isAuthenticated = await checkAuthAndThrow(context.auth);

        // redundant check for typing
        if (!context.auth) {
            throw new Error("Auth0 context not found.");
        }

        // log the user in if they're accessing an authenticated route without being authenticated
        if (!isAuthenticated) {
            console.debug("User is not authenticated, redirecting to /login");
            throw redirect({ to: "/login" });
        }

        // fetch info from venus
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
