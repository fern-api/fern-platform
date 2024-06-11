import { FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { DocsPage, REGISTRY_SERVICE } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { getDocsPageProps } from "../../../utils/getDocsPageProps";

export default DocsPage;

export const getStaticProps: GetStaticProps<DocsPage.Props> = async (context) => {
    const { params = {} } = context;
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? (params.host as string);
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    const result = await getDocsPageProps(xFernHost, slugArray);

    return visitDiscriminatedUnion(result, "type")._visit<ReturnType<GetStaticProps<DocsPage.Props>>>({
        notFound: () => ({ notFound: true }),
        redirect: ({ redirect }) => ({ redirect }),
        props: ({ props }) => ({ props }),
        _other: () => ({ notFound: true }),
    });
};

export const getStaticPaths: GetStaticPaths = async () => {
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN as string,
    });

    if (!docs.ok) {
        return {
            paths: [],
            fallback: "blocking",
        };
    }

    const root = FernNavigation.utils.convertLoadDocsForUrlResponse(docs.body);
    return {
        paths: FernNavigation.NodeCollector.collect(root)
            .getPageSlugs()
            .map((path) => {
                return {
                    params: {
                        host: docs.body.baseUrl.domain,
                        slug: path.split("/"),
                    },
                };
            }),
        fallback: false,
    };
};
