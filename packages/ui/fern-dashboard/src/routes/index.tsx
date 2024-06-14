import { ErrorRenderer } from "@/components/errors/ErrorRenderer";
import { useOrganizationIds } from "@/services/venus";
import { useAuth0 } from "@auth0/auth0-react";
import { CatchBoundary, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
    component: () => (
        <CatchBoundary
            getResetKey={() => "reset"}
            onCatch={(error) => console.error(error)}
            errorComponent={ErrorRenderer}
        >
            <Index />
        </CatchBoundary>
    ),
});

const Index: React.FC = () => {
    const auth = useAuth0();
    const navigate = useNavigate();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [token, setToken] = useState<string>();

    // Check for Auth0 to update auth
    useEffect(() => {
        setIsAuthLoading(auth.isLoading);

        const getToken = async () => {
            setToken(await auth.getAccessTokenSilently());
        };
        if (!auth.isLoading && auth.isAuthenticated) {
            getToken();
        }
    }, [auth.isAuthenticated, auth.isLoading]);

    // Check for our organization query to complete
    const { isLoading: isDataLoading, data: fetchedIds } = useOrganizationIds(token);
    useEffect(() => {
        if (!isDataLoading) {
            if (!fetchedIds || fetchedIds.length === 0) {
                throw new Error("No organizations found");
            }
            navigate({ to: "/team/$orgId", params: { orgId: fetchedIds[0] } });
        }
    }, [isAuthLoading, auth.isAuthenticated, isDataLoading]);

    // Outlet depending on the auth status
    if (isAuthLoading) {
        return <div>Loading...</div>;
    }
    if (!auth.isAuthenticated) {
        console.debug("User is not authenticated, redirecting to /login");
        navigate({ to: "/login" });
    }
};
