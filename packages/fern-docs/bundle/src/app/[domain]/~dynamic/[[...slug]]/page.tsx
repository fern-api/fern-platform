"use server";

import { cookies } from "next/headers";
import { Metadata } from "next/types";
import { DocsPageComponent, generateDocsPageMetadata } from "../../docs-page";

export default async function Page({
  params,
}: {
  params: { slug?: string[]; domain: string };
}) {
  const fern_token = cookies().get("fern_token")?.value;
  return <DocsPageComponent params={params} fern_token={fern_token} />;
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[]; domain: string };
}): Promise<Metadata> {
  const fern_token = cookies().get("fern_token")?.value;
  return generateDocsPageMetadata({ params, fern_token });
}
