import { Metadata } from "next/types";
import React from "react";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";

import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function Layout(props: { children: React.ReactNode }) {
  return props.children;
}

export async function generateMetadata(props: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await props.params;

  const docsLoader = await createCachedDocsLoader(domain);
  const baseUrl = await docsLoader.getBaseUrl();

  return {
    metadataBase: new URL(
      baseUrl.basePath || "/",
      withDefaultProtocol(docsLoader.domain)
    ),
  };
}
