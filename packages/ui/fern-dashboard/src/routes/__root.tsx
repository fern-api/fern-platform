import { ErrorRenderer } from "@/components/errors/ErrorRenderer";
import { CatchBoundary, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRouteWithContext()({
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
