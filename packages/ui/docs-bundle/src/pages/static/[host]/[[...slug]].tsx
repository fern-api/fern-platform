import { getDocsPageProps } from "@/server/getDocsPageProps";
import { withSSGProps } from "@/server/withSSGProps";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { DocsPage } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { ComponentProps } from "react";
import { DocsKVCache } from "../../../server/DocsKVCache";

export default DocsPage;

export const getStaticProps: GetStaticProps<ComponentProps<typeof DocsPage>> = async (context) => {
    const { params = {} } = context;
    const xFernHost = params.host as string;
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    const props = await withSSGProps(getDocsPageProps(xFernHost, slugArray));

    const cache = DocsKVCache.for(xFernHost);
    const slug = FernNavigation.utils.slugjoin(...slugArray);

    if ("props" in props) {
        await cache.visitedSlugs.add(slug);
    } else if ("notFound" in props || "redirect" in props) {
        await cache.visitedSlugs.remove(slug);
    }

    return props;
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
