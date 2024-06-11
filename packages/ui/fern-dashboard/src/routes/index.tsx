import { ErrorRenderer } from "@/components/errors/ErrorRenderer";
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

        // Since we only have one page, let's just always redirect to /team for now
        throw redirect({ to: "/team" });
    },
});
