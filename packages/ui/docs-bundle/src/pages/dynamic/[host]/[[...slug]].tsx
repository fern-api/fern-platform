import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { DocsPage } from "@fern-ui/ui";
import { GetServerSideProps } from "next";
import { getDocsPageProps, getPrivateDocsPageProps } from "../../../utils/getDocsPageProps";

export default DocsPage;

export const getServerSideProps: GetServerSideProps = (context) => {
    if (context.query.error === "true") {
        context.res.statusCode = 500;
    }

    return getDocsServerSideProps(context);
};

const getDocsServerSideProps: GetServerSideProps<DocsPage.Props> = async ({ params = {}, req, res }) => {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? (params.host as string);
    // eslint-disable-next-line no-console
    console.log(`[getDocsServerSideProps] host=${xFernHost}`);
    const slugArray = params.slug == null ? [] : Array.isArray(params.slug) ? params.slug : [params.slug];

    const token = req.cookies.fern_token;

    if (token == null) {
        const result = await getDocsPageProps(xFernHost, slugArray);


        return visitDiscriminatedUnion(result, "type")._visit<ReturnType<GetServerSideProps<DocsPage.Props>>>({
            notFound: () => Promise.resolve({ notFound: true }),
            redirect: (redirect) => Promise.resolve({ redirect: redirect.redirect }),
            props: (props) => Promise.resolve({ props: props.props }),
            _other: () => Promise.resolve({ notFound: true }),
        });
    } else {
        const result = await getPrivateDocsPageProps(xFernHost, slugArray, token, res);

        return visitDiscriminatedUnion(result, "type")._visit<ReturnType<GetServerSideProps<DocsPage.Props>>>({
            notFound: () => Promise.resolve({ notFound: true }),
            redirect: (redirect) => Promise.resolve({ redirect: redirect.redirect }),
            props: (props) => Promise.resolve({ props: props.props }),
            _other: () => Promise.resolve({ notFound: true }),
        });
    }
};
