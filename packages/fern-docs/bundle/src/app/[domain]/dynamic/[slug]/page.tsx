import "server-only";

import { Metadata } from "next/types";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { getFernToken } from "@/app/fern-token";
import SharedPage, {
  generateMetadata as _generateMetadata,
} from "@/components/shared-page";

export default async function DynamicPage(props: {
  params: Promise<{ slug: string; domain: string }>;
}) {
  const { domain, slug } = await props.params;
  return (
    <SharedPage
      domain={domain}
      slug={slugjoin(slug)}
      fernToken={await getFernToken()}
    />
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string; domain: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await props.params;
  return _generateMetadata({
    domain,
    slug: slugjoin(slug),
    fernToken: await getFernToken(),
  });
}
