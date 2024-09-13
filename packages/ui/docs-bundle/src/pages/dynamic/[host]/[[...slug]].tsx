import {
    convertStaticToServerSidePropsResult,
    getDocsPageProps,
    getDynamicDocsPageProps,
    getNextPublicDocsDomain,
} from "@fern-ui/docs-server";
import { DocsPage } from "@fern-ui/ui";
import { GetServerSideProps } from "next";
import { ComponentProps } from "react";

export default DocsPage;

export const getServerSideProps: GetServerSideProps = (context) => {
    if (context.query.error === "true") {
        context.res.statusCode = 500;
    }

    return getDocsServerSideProps(context);
};

const getDocsServerSideProps: GetServerSideProps<ComponentProps<typeof DocsPage>> = async ({
    params = {},
    req,
    res,
}) => {
    const xFernHost = getNextPublicDocsDomain() ?? (params.host as string);
    // eslint-disable-next-line no-console
    console.log(`[getDocsServerSideProps] host=${xFernHost}`);
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    const token = req.cookies.fern_token;

    if (token == null) {
        return convertStaticToServerSidePropsResult(await getDocsPageProps(xFernHost, slugArray));
    } else {
        return getDynamicDocsPageProps(xFernHost, slugArray, req.cookies, res);
    }
};
