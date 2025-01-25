import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies, headers } from "next/headers";
import { getDocsDomainApp, getHostApp } from "./xfernhost/app";

export async function withServerProps() {
  const domain = await getDocsDomainApp();
  const host = (await getHostApp()) ?? domain;
  const fern_token = await cookies().then(
    (cookies) => cookies.get(COOKIE_FERN_TOKEN)?.value
  );
  const rawCookie = await headers().then(
    (headers) => headers.get("cookie") ?? undefined
  );

  return {
    domain,
    host,
    fern_token,
    rawCookie,
  };
}
