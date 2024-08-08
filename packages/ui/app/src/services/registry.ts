import { FdrClient, once } from "@fern-api/fdr-sdk";

export const provideRegistryService = once(() => new FdrClient());
