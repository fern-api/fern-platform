import { FernRegistryClient } from "@fern-api/fdr-sdk";

export const REGISTRY_SERVICE = new FernRegistryClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});
