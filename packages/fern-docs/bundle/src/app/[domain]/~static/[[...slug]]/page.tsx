"use server";

import { Metadata } from "next/types";
import { DocsPageComponent, generateDocsPageMetadata } from "../../docs-page";

export default async function Page({
  params,
}: {
  params: { slug?: string[]; domain: string };
}) {
  return <DocsPageComponent params={params} />;
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[]; domain: string };
}): Promise<Metadata> {
  return generateDocsPageMetadata({ params });
}
