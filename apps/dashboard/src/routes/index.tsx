import { Loading } from "@/components/Loading";
import { ErrorRenderer } from "@/components/errors/ErrorRenderer";
import { useOrganizationIds } from "@/services/venus";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "@fern-ui/components";
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
        if (token && auth.isAuthenticated && !isDataLoading) {
            if (!fetchedIds || fetchedIds.length === 0) {
                navigate({ to: "/login", search: { error: "no_orgs", redirect: false } });
                toast.error("We had trouble finding your organization. Please try again later.", { id: "no_orgs" });
                return;
            }
            navigate({ to: "/team/$orgId", params: { orgId: fetchedIds[0] } });
        }
    }, [token, isAuthLoading, auth.isAuthenticated, isDataLoading]);

    // Outlet depending on the auth status
    if (isAuthLoading) {
        return <Loading fullPage />;
    }
    if (!auth.isAuthenticated) {
        navigate({ to: "/login" });
    }
};
