import "server-only";

import { Metadata } from "next/types";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import Page, { generateMetadata as _generateMetadata } from "../../_page";

export default async function DynamicPage(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}) {
  const { domain, slug } = await props.params;
  return <Page domain={domain} slug={slugjoin(slug)} />;
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; domain: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await props.params;
  return _generateMetadata({ domain, slug: slugjoin(slug) });
}
