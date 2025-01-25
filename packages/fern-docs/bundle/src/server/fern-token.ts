import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies } from "next/headers";

export async function fernToken() {
  return await cookies().then(
    (cookies) => cookies.get(COOKIE_FERN_TOKEN)?.value
  );
}
