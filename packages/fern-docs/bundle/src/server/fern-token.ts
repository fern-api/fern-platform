import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies } from "next/headers";

export function fernToken() {
  return cookies().get(COOKIE_FERN_TOKEN)?.value;
}
