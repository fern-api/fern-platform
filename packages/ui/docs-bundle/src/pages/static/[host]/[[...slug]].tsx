import { DocsKVCache } from "@/server/DocsCache";
import { getDocsPageProps } from "@/server/getDocsPageProps";
import { withSSGProps } from "@/server/withSSGProps";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DocsPage } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { ComponentProps } from "react";

export default DocsPage;

export const getStaticProps: GetStaticProps<ComponentProps<typeof DocsPage>> = async (context) => {
    const { params = {} } = context;
    const xFernHost = params.host as string;
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    const props = await withSSGProps(getDocsPageProps(xFernHost, slugArray));

    const cache = DocsKVCache.getInstance(xFernHost);
    const slug = FernNavigation.utils.slugjoin(...slugArray);

    if ("props" in props) {
        cache.addVisitedSlugs(slug);
    } else if ("notFound" in props || "redirect" in props) {
        cache.removeVisitedSlugs(slug);
    }

    return props;
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
