"use server";

import { cookies } from "next/headers";
import { Metadata } from "next/types";
import Page, { generateMetadata as _generateMetadata } from "../../_page";

export default async function StaticPage({
  params,
}: {
  params: { slug?: string[]; domain: string };
}) {
  const fern_token = cookies().get("fern_token")?.value;
  return <Page params={params} fern_token={fern_token} />;
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[]; domain: string };
}): Promise<Metadata> {
  const fern_token = cookies().get("fern_token")?.value;
  return _generateMetadata({ params, fern_token });
}
