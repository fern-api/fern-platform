import { DocsPage } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { ComponentProps } from "react";
import { getDocsPageProps } from "../../../utils/getDocsPageProps";
import { getNextPublicDocsDomain } from "../../../utils/xFernHost";

export default DocsPage;

export const getStaticProps: GetStaticProps<ComponentProps<typeof DocsPage>> = async (context) => {
    const { params = {} } = context;
    const xFernHost = getNextPublicDocsDomain() ?? (params.host as string);
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    return getDocsPageProps(xFernHost, slugArray);
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
