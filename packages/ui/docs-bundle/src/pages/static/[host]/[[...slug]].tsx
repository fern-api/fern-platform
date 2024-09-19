import { getDocsPageProps } from "@/server/getDocsPageProps";
import { withSSGProps } from "@/server/withSSGProps";
import { DocsPage } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { ComponentProps } from "react";

export default DocsPage;

export const getStaticProps: GetStaticProps<ComponentProps<typeof DocsPage>> = async (context) => {
    const { params = {} } = context;
    const xFernHost = params.host as string;
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    return withSSGProps(getDocsPageProps(xFernHost, slugArray));
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
