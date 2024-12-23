import { getDocsPageProps } from "@/server/getDocsPageProps";
import { updateVisitedSlugsCache } from "@/server/updateVisitedSlugsCache";
import { withSSGProps } from "@/server/withSSGProps";
import { getHostNodeStatic } from "@/server/xfernhost/node";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { DocsPage } from "@fern-docs/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import type { ParsedUrlQuery } from "querystring";
import { ComponentProps } from "react";

export default DocsPage;

export const getStaticProps: GetStaticProps<
  ComponentProps<typeof DocsPage>
> = async (context) => {
  const { params = {} } = context;
  const domain = getDomain(params);
  if (typeof domain !== "string") {
    return { notFound: true };
  }

  const host = getHost(params) ?? getHostNodeStatic() ?? domain;
  const slug = FernNavigation.slugjoin(params.slug);

  const props = await withSSGProps(getDocsPageProps(domain, host, slug));

  await updateVisitedSlugsCache(domain, slug, props);

  return props;
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

function getHost(params: ParsedUrlQuery): string | undefined {
  return typeof params.host === "string" ? params.host : undefined;
}

function getDomain(params: ParsedUrlQuery): string | undefined {
  return typeof params.domain === "string" ? params.domain : undefined;
}
