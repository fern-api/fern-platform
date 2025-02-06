import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies, headers } from "next/headers";
import { getDocsDomainApp, getHostApp } from "./xfernhost/app";

export function withServerProps() {
  const domain = getDocsDomainApp();
  const host = getHostApp() ?? domain;
  const fern_token = cookies().get(COOKIE_FERN_TOKEN)?.value;
  const rawCookie = headers().get("cookie") ?? undefined;

  return {
    domain,
    host,
    fern_token,
    rawCookie,
  };
}
