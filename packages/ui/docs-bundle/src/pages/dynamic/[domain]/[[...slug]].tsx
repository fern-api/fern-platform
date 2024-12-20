import { getDynamicDocsPageProps } from "@/server/getDynamicDocsPageProps";
import { getHostNode } from "@/server/xfernhost/node";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { DocsPage } from "@fern-ui/ui";
import { GetServerSideProps } from "next";

export default DocsPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query, params = {} }) => {
    if (query.error === "true") {
        res.statusCode = 500;
    }

    const domain = params.domain as string;
    const host = getHostNode(req) ?? domain;
    const slug = FernNavigation.slugjoin(params.slug);

    return getDynamicDocsPageProps(domain, host, slug, req.cookies);
};
