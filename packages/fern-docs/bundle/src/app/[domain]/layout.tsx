import { Metadata } from "next/types";
import React from "react";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";

import { createCachedDocsLoader } from "@/server/docs-loader";

export default function Layout(props: { children: React.ReactNode }) {
  return props.children;
}

export async function generateMetadata(props: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await props.params;

  const loader = await createCachedDocsLoader(domain);
  const baseUrl = await loader.getBaseUrl();

  return {
    metadataBase: new URL(
      baseUrl.basePath || "/",
      withDefaultProtocol(loader.domain)
    ),
  };
}
