import { FdrClient } from "@fern-api/fdr-sdk/client";
import { once } from "es-toolkit/function";

function getEnvironment() {
    return (
        process.env.NEXT_PUBLIC_FDR_ORIGIN ??
        "https://registry.buildwithfern.com"
    );
}

function getFernToken() {
    const fernToken = process.env.FERN_TOKEN;
    if (!fernToken) {
        throw new Error("FERN_TOKEN is not set");
    }
    return fernToken;
}

export const provideRegistryService = once(
    () =>
        new FdrClient({ environment: getEnvironment(), token: getFernToken() })
);
