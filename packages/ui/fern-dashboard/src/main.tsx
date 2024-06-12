import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";

// Import the generated route tree
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Toaster } from "@fern-ui/components";
import { routeTree } from "./routeTree.gen";
import { getEnvVar } from "./utils";

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        auth: undefined,
        venusClient: undefined,
        orgIds: undefined,
    },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

function EnrichedRouterProvider() {
    const auth = useAuth0();
    return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={getEnvVar("AUTH0_DOMAIN", "https://fern-dev.us.auth0.com")}
            clientId={getEnvVar("AUTH0_CLIENT_ID", "tMKB01W3Y1seQzBuHZwnPuoYC782SAt9")}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: getEnvVar("VENUS_AUDIENCE", "venus-dev"),
                // Make login redirect go right to github and not auth0's
                // universal login page.
                connection: "github",
            }}
        >
            <EnrichedRouterProvider />
        </Auth0Provider>
        <Toaster position="top-center" />
    </React.StrictMode>,
);
