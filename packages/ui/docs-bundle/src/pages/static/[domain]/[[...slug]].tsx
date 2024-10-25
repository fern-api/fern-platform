import { getDocsPageProps } from "@/server/getDocsPageProps";
import { updateVisitedSlugsCache } from "@/server/updateVisitedSlugsCache";
import { withSSGProps } from "@/server/withSSGProps";
import { getHostNodeStatic } from "@/server/xfernhost/node";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { DocsPage } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { ComponentProps } from "react";
import { Agent, setGlobalDispatcher } from "undici";

setGlobalDispatcher(new Agent({ connect: { timeout: 5_000 } }));

export default DocsPage;

export const getStaticProps: GetStaticProps<ComponentProps<typeof DocsPage>> = async (context) => {
    const { params = {} } = context;
    const domain = params.domain as string;
    const host = getHostNodeStatic() ?? domain;
    const slug = FernNavigation.slugjoin(params.slug);

    const props = await withSSGProps(getDocsPageProps(domain, host, slug));

    await updateVisitedSlugsCache(domain, slug, props);

    return props;
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
