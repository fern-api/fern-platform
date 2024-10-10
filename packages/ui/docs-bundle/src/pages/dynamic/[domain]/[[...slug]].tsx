import { getDynamicDocsPageProps } from "@/server/getDynamicDocsPageProps";
import { getHostNodeStatic } from "@/server/xfernhost/node";
import { DocsPage } from "@fern-ui/ui";
import { GetServerSideProps } from "next";

export default DocsPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query, params = {} }) => {
    if (query.error === "true") {
        res.statusCode = 500;
    }

    const domain = params.domain as string;
    const host = getHostNodeStatic() ?? domain;
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    return getDynamicDocsPageProps(domain, host, slugArray, req.cookies);
};
