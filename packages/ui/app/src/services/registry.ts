import { FdrClient } from "@fern-api/fdr-sdk";
import { once } from "lodash-es";

export const provideRegistryService = once(() => new FdrClient());
