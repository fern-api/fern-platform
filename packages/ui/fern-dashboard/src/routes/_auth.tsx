import { Loading } from "@/components/Loading";
import { useAuth0 } from "@auth0/auth0-react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { z } from "zod";
import { maybeOrganizationSearchSchema } from "./_auth/login";

const maybeAuthRedirectSearchSchema = maybeOrganizationSearchSchema.extend({
    error: z.optional(z.string()),
    redirect: z.optional(z.boolean()),
});

export const Route = createFileRoute("/_auth")({
    component: () => <UnauthenticatedOutlet />,
    validateSearch: maybeAuthRedirectSearchSchema,
});

const UnauthenticatedOutlet: React.FC = () => {
    const auth = useAuth0();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const { error, redirect, invitation, organization, organization_name } = Route.useSearch();
    const navigate = useNavigate();

    useEffect(() => {
        setIsAuthLoading(auth.isLoading);
    }, [auth, auth.isLoading]);

    if (isAuthLoading) {
        return <Loading fullPage />;
    }

    if ((invitation && organization && organization_name) || (error && redirect === false)) {
        return <Outlet />;
    }

    if (auth.isAuthenticated) {
        navigate({ to: "/" });
    }

    return <Outlet />;
};
