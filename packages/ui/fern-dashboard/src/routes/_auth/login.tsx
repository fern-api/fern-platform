import { createFileRoute } from "@tanstack/react-router";

// We try to leverage auth0's loginWithRedirect method to redirect the user to the login page
// but since it has some papercuts and needs error handling, we're making a custom login page
// to handle errors and allow users to reattempt logging in.
export const Route = createFileRoute("/_auth/login")({
    component: () => <div>Hello /_auth/login!</div>,
});
