"use server";

import { DocsMetadata, getMetadata } from "../docs-loader";
import { getDocsDomainApp } from "../xfernhost/app";

export async function getMetadataAction(): Promise<DocsMetadata> {
  const domain = await getDocsDomainApp();
  return getMetadata(domain);
}
