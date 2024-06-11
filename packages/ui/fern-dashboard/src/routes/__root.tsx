import { ErrorRenderer } from "@/components/errors/ErrorRenderer";
import { Auth0ContextInterface, User } from "@auth0/auth0-react";
import { FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { CatchBoundary, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

interface RootRouteContext {
    auth: Auth0ContextInterface<User> | undefined;
    venusClient?: FernVenusApiClient;
    orgIds?: string[];
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
    component: () => (
        <>
            <CatchBoundary
                getResetKey={() => "reset"}
                onCatch={(error) => console.error(error)}
                errorComponent={ErrorRenderer}
            >
                <Outlet />
            </CatchBoundary>
            <TanStackRouterDevtools />
        </>
    ),
});
