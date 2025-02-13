import "server-only";

import { Metadata } from "next/types";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import Page, { generateMetadata as _generateMetadata } from "../../_page";

export const dynamic = "force-static";

export default async function StaticPage(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}) {
  const { domain, slug } = await props.params;
  return <Page domain={domain} slug={slugjoin(slug)} static />;
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await props.params;
  return _generateMetadata({ domain, slug: slugjoin(slug), static: true });
}
