import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { DocsPage, getDocsPageProps } from "@fern-ui/ui";
import { compact } from "lodash-es";
import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions, getAuthorizationUrl } from "../../auth";
import { SessionProps } from "../_app";

export default DocsPage;

export const getServerSideProps: GetServerSideProps<DocsPage.Props & SessionProps> = async ({
    req,
    res,
    params = {},
}) => {
    const xFernHost = `${params.subdomain}.docs.buildwithfern.com`;
    const slugArray = compact(params.slug);
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return {
            redirect: {
                destination: getAuthorizationUrl({
                    organization: "org_01HMWD9VS0JY61CYKAFWMJSX5Q",
                }),
                permanent: false,
            },
        };
    }

    const result = await getDocsPageProps(xFernHost, slugArray);

    return visitDiscriminatedUnion(result, "type")._visit<GetServerSidePropsResult<DocsPage.Props & SessionProps>>({
        notFound: () => ({ notFound: true }),
        redirect: (redirect) => ({ redirect: redirect.redirect }),
        props: (props) => ({
            props: {
                ...props.props,
            },
        }),
        _other: () => ({ notFound: true }),
    });
};
