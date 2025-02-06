import { FdrClient } from "@fern-api/fdr-sdk/client";
import { once } from "es-toolkit/function";
import { fernToken_admin } from "./env-variables";

function getEnvironment() {
  return (
    process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com"
  );
}

export const provideRegistryService = once(
  () =>
    new FdrClient({ environment: getEnvironment(), token: fernToken_admin() })
);
