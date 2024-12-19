import type { GetServerSideProps } from "next";
import Error, { ErrorProps } from "next/error";
import { ReactElement } from "react";

export function parseResolvedUrl(resolvedUrl: string): string {
    // if resolvedUrl is `/static/[domain]/[...slug]` or `/dynamic/[domain]/[..slug]` then return '/[...slug]`
    const match = resolvedUrl.match(/\/(static|dynamic)\/[^/]+(.*)/);
    return match?.[2] ?? resolvedUrl;
}

export const dynamic = "force-dynamic";

export const getServerSideProps: GetServerSideProps<ErrorProps> = async ({
    req,
    res,
    resolvedUrl,
    query,
}) => {
    if (
        res.statusCode >= 500 &&
        res.statusCode < 600 &&
        req.url != null &&
        resolvedUrl.startsWith("/static") &&
        query.error !== "true"
    ) {
        const url = parseResolvedUrl(resolvedUrl);
        return {
            redirect: {
                destination: `${url}${url.includes("?") ? "&" : "?"}error=true`,
                permanent: false,
            },
        };
    }
    return {
        props: {
            statusCode: res.statusCode,
            title: res.statusMessage ?? "",
        },
    };
};

export default function Page(props: ErrorProps): ReactElement {
    return <Error {...props} />;
}

// TODO: Uncomment this code to enable Sentry error tracking
// Page.getInitialProps = async (contextData: NextPageContext) => {
//     await Sentry.captureUnderscoreErrorException(contextData);
// };
