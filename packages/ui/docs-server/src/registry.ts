import { FdrClient, once } from "@fern-api/fdr-sdk";

function getEnvironment() {
    return process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com";
}

export const provideRegistryService = once(() => new FdrClient({ environment: getEnvironment() }));

export function getRegistryServiceWithToken(token: string): FdrClient {
    return new FdrClient({ environment: getEnvironment(), token });
}
