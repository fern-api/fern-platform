import { ErrorRenderer } from "@/components/errors/ErrorRenderer";
import { useAuth0 } from "@auth0/auth0-react";
import { CatchBoundary, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated")({
    component: () => (
        <CatchBoundary
            getResetKey={() => "reset"}
            onCatch={(error) => console.error(error)}
            errorComponent={ErrorRenderer}
        >
            <AuthenticatedOutlet />
        </CatchBoundary>
    ),
});

const AuthenticatedOutlet: React.FC = () => {
    const auth = useAuth0();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setIsAuthLoading(auth.isLoading);
    }, [auth, auth.isLoading]);

    if (isAuthLoading) {
        console.log("Loading...");
        return <div>Loading...</div>;
    }

    if (!auth.isAuthenticated) {
        console.debug("User is not authenticated, redirecting to /login");
        navigate({ to: "/login" });
    }

    return <Outlet />;
};
