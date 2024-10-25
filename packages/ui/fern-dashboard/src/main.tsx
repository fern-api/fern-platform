import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./_.scss";

// Import the generated route tree
import { Auth0Provider } from "@auth0/auth0-react";
import { FernTooltipProvider, Toaster } from "@fern-ui/components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { getEnvVar } from "./utils";

// Create a new router instance
const router = createRouter({
    routeTree,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const queryClient = new QueryClient();

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
            <QueryClientProvider client={queryClient}>
                <FernTooltipProvider>
                    <RouterProvider router={router} />
                </FernTooltipProvider>
            </QueryClientProvider>
        </Auth0Provider>
        <Toaster position="top-center" />
    </React.StrictMode>,
);
