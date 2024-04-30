import { GetServerSideProps } from "next";
import Error, { ErrorProps } from "next/error";
import { ReactElement } from "react";

export function parseResolvedUrl(resolvedUrl: string): string {
    // if resolvedUrl is `/static/[host]/[...slug]` or `/dynamic/[host]/[..slug]` then return '/[...slug]`
    const match = resolvedUrl.match(/\/(static|dynamic)\/[^/]+(.*)/);
    return match?.[2] ?? resolvedUrl;
}

export const getServerSideProps: GetServerSideProps<ErrorProps> = async ({ req, res, resolvedUrl, query }) => {
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
            // title: res.statusMessage,
        },
    };
};

export default function Page(props: ErrorProps): ReactElement {
    return <Error {...props} />;
}
