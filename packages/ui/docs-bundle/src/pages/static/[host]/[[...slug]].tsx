import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { DocsPage } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { ComponentProps } from "react";
import { getDocsPageProps } from "../../../utils/getDocsPageProps";

export default DocsPage;

export const getStaticProps: GetStaticProps<ComponentProps<typeof DocsPage>> = async (context) => {
    const { params = {} } = context;
    const xFernHost = params.host as string;
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    const result = await getDocsPageProps(xFernHost, slugArray);

    return visitDiscriminatedUnion(result, "type")._visit<ReturnType<GetStaticProps<ComponentProps<typeof DocsPage>>>>({
        notFound: (notFound) => ({ notFound: true, revalidate: notFound.revalidate }),
        redirect: (redirect) => ({ redirect: redirect.redirect, revalidate: redirect.revalidate }),
        props: (props) => ({ props: props.props, revalidate: props.revalidate }),
        _other: () => ({ notFound: true }),
    });
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
