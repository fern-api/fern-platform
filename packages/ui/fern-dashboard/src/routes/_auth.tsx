import { useAuth0 } from "@auth0/auth0-react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_auth")({
    component: () => <UnauthenticatedOutlet />,
});

const UnauthenticatedOutlet: React.FC = () => {
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

    if (auth.isAuthenticated) {
        console.debug("User is not authenticated, redirecting to /login");
        navigate({ to: "/" });
    }

    return <Outlet />;
};
