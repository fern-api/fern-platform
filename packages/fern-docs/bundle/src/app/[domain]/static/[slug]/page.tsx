import "server-only";

import { Metadata } from "next/types";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import SharedPage, {
  generateMetadata as _generateMetadata,
} from "@/components/shared-page";

export const dynamic = "force-static";

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string; domain: string }>;
}) {
  const { domain, slug } = await params;
  return <SharedPage domain={domain} slug={slugjoin(slug)} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; domain: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  return _generateMetadata({ domain, slug: slugjoin(slug) });
}
