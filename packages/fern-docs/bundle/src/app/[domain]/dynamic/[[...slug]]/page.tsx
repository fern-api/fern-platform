import "server-only";

import { cookies } from "next/headers";
import { Metadata } from "next/types";

import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import Page, { generateMetadata as _generateMetadata } from "../../_page";

export default async function StaticPage(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}) {
  const [params, cookieJar] = await Promise.all([props.params, cookies()]);
  const fern_token = cookieJar.get(COOKIE_FERN_TOKEN)?.value;
  return <Page params={params} fern_token={fern_token} />;
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}): Promise<Metadata> {
  const [params, cookieJar] = await Promise.all([props.params, cookies()]);
  const fern_token = cookieJar.get(COOKIE_FERN_TOKEN)?.value;
  return _generateMetadata({ params, fern_token });
}
