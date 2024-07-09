import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { DocsPage } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { getDocsPageProps } from "../../../utils/getDocsPageProps";

export default DocsPage;

export const getStaticProps: GetStaticProps<DocsPage.Props> = async (context) => {
    const { params = {} } = context;
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? (params.host as string);
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    const result = await getDocsPageProps(xFernHost, slugArray, true);

    return visitDiscriminatedUnion(result, "type")._visit<ReturnType<GetStaticProps<DocsPage.Props>>>({
        notFound: (notFound) => ({ notFound: true, revalidate: notFound.revalidate }),
        redirect: (redirect) => ({ redirect: redirect.redirect, revalidate: redirect.revalidate }),
        props: (props) => ({ props: props.props, revalidate: props.revalidate }),
        _other: () => ({ notFound: true }),
    });
};

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
