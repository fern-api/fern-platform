import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { DocsPage, getDocsPageProps } from "@fern-ui/ui";
import { compact } from "lodash-es";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions, getAuthorizationUrl } from "../../auth";

export default DocsPage;

export const getServerSideProps: GetServerSideProps<DocsPage.Props> = async ({ req, res, params = {} }) => {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? (params.host as string);
    const slugArray = compact(params.slug);
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return {
            redirect: {
                destination: getAuthorizationUrl({
                    organizationId: "org_01HMWD9VS0JY61CYKAFWMJSX5Q",
                }),
                permanent: false,
            },
        };
    }

    const result = await getDocsPageProps(xFernHost, slugArray);

    return visitDiscriminatedUnion(result, "type")._visit<GetServerSidePropsResult<DocsPage.Props>>({
        notFound: () => ({ notFound: true }),
        redirect: (redirect) => ({ redirect: redirect.redirect }),
        props: (props) => ({
            props: {
                ...props.props,
                session,
            },
        }),
        _other: () => ({ notFound: true }),
    });
};
