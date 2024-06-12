import { checkAuthSilent } from "@/utils";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
    component: () => <Outlet />,
    beforeLoad: async ({ context }) => {
        const isAuthenticated = await checkAuthSilent(context.auth);

        if (isAuthenticated) {
            throw redirect({ to: "/", replace: true });
        }
    },
});
