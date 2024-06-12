import { ErrorRenderer } from "@/components/errors/ErrorRenderer";
import { getAPIResponse } from "@/services/fern";
import { getVenusClient } from "@/services/venus";
import { checkAuthAndThrow } from "@/utils";
import { CatchBoundary, Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: () => (
        <CatchBoundary
            getResetKey={() => "reset"}
            onCatch={(error) => console.error(error)}
            errorComponent={ErrorRenderer}
        >
            <Outlet />
        </CatchBoundary>
    ),
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

        // // Since we only have one page, let's just always redirect to /team for now
        const orgIds = context.orgIds;
        let orgId: string;

        // Technically could just assert that orgIds is non-null, but
        // it's better to be safe than sorry
        if (!orgIds || orgIds.length === 0) {
            const token = await context.auth!.getAccessTokenSilently();
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
