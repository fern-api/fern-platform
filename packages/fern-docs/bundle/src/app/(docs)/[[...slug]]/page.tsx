"use server";

import { getDocsDomainApp } from "@/server/xfernhost/app";
import { cookies } from "next/headers";
import { Metadata } from "next/types";
import { DocsPageComponent, generateDocsPageMetadata } from "../docs-page";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const domain = getDocsDomainApp();
  const fern_token = cookies().get("fern_token")?.value;
  return (
    <DocsPageComponent params={{ ...params, domain }} fern_token={fern_token} />
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const domain = getDocsDomainApp();
  const fern_token = cookies().get("fern_token")?.value;
  return generateDocsPageMetadata({
    params: { ...params, domain },
    fern_token,
  });
}
