import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getEnv } from "@vercel/functions";
import { headers } from "next/headers";

export function getOrigin() {
  const { VERCEL_ENV } = getEnv();
  return withDefaultProtocol(
    (VERCEL_ENV === "preview" ? headers().get("host") : undefined) ||
      headers().get("x-fern-host") ||
      headers().get("host") ||
      ""
  );
}
