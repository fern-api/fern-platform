import "server-only";

import { Metadata } from "next/types";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import Page, { generateMetadata as _generateMetadata } from "../../_page";

export const dynamic = "force-static";

export default async function StaticPage(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}) {
  console.debug(
    "/app/[domain]/(external)/(docs)/static/[[...slug]]/page.tsx: starting..."
  );
  console.time("/app/[domain]/(external)/(docs)/static/[[...slug]]/page.tsx");
  const { domain, slug } = await props.params;

  console.timeEnd(
    "/app/[domain]/(external)/(docs)/static/[[...slug]]/page.tsx"
  );
  return <Page domain={domain} slug={slugjoin(slug)} />;
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  return _generateMetadata({
    domain: params.domain,
    slug: slugjoin(params.slug),
    fern_token: undefined,
  });
}
