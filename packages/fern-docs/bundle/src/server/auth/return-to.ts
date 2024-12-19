import { AuthEdgeConfig } from "@fern-docs/auth";

// by default, we use "state" as a query parameter for returning the user to the original page after login.
// this is the most compatible query parameter used by auth providers, but it's not the correct usage of the state query parameter.
// if the customer's auth provider requires the state query parameter to be named differently, they can override the default value in edge config.
// TODO: we should think through how to make this better in the future, and reduce the security risks of leaving the state query parameter unvalidated.
const DEFAULT_RETURN_TO_QUERY_PARAM = "state";
export function getReturnToQueryParam(
    authConfig?: AuthEdgeConfig | undefined
): string {
    if (authConfig?.type === "oauth2") {
        return DEFAULT_RETURN_TO_QUERY_PARAM;
    }

    return authConfig?.type === "basic_token_verification"
        ? authConfig.returnToQueryParam ?? DEFAULT_RETURN_TO_QUERY_PARAM
        : DEFAULT_RETURN_TO_QUERY_PARAM;
}
