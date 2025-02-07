"use server";

import { Metadata } from "next/types";
import Page, { generateMetadata as _generateMetadata } from "../../_page";

export default async function StaticPage({
  params,
}: {
  params: { slug?: string[]; domain: string };
}) {
  return <Page params={params} fern_token={undefined} />;
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[]; domain: string };
}): Promise<Metadata> {
  return _generateMetadata({ params, fern_token: undefined });
}
