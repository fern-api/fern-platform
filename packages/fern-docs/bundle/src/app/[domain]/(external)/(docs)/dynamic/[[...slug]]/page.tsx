import "server-only";

import { cookies } from "next/headers";
import { Metadata } from "next/types";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import Page, { generateMetadata as _generateMetadata } from "../../_page";

export default async function DynamicPage(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}) {
  console.debug(
    "/app/[domain]/(external)/(docs)/dynamic/[[...slug]]/page.tsx: starting..."
  );
  console.time("/app/[domain]/(external)/(docs)/dynamic/[[...slug]]/page.tsx");

  const [params, cookieJar] = await Promise.all([props.params, cookies()]);
  const fern_token = cookieJar.get(COOKIE_FERN_TOKEN)?.value;

  console.timeEnd(
    "/app/[domain]/(external)/(docs)/dynamic/[[...slug]]/page.tsx"
  );
  return (
    <Page
      domain={params.domain}
      slug={slugjoin(params.slug)}
      fern_token={fern_token}
    />
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}): Promise<Metadata> {
  const [params, cookieJar] = await Promise.all([props.params, cookies()]);
  const fern_token = cookieJar.get(COOKIE_FERN_TOKEN)?.value;
  return _generateMetadata({
    domain: params.domain,
    slug: slugjoin(params.slug),
    fern_token,
  });
}
