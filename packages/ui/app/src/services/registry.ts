import { FdrClient } from "@fern-api/fdr-sdk/client/types";

export const REGISTRY_SERVICE = new FdrClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});
