import { once } from "es-toolkit/function";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";

const APP_BUILDWITHFERN_COM = "app.buildwithfern.com";

export const getAppBuildwithfernCom = once((): string => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // see: https://vercel.com/docs/projects/environment-variables/system-environment-variables#framework-environment-variables
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development"
  ) {
    // this mimics the behavior of hitting app.buildwithfern.com in a preview environment
    return withDefaultProtocol(
      process.env.NEXT_PUBLIC_VERCEL_URL ?? APP_BUILDWITHFERN_COM
    );
  }

  return withDefaultProtocol(APP_BUILDWITHFERN_COM);
});
