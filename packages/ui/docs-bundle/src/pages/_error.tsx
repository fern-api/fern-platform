import { PageRouterErrorProps, pageRouterCustomErrorHandler } from "@highlight-run/next/ssr";
import Error from "next/error";
import { useRouter } from "next/router";
import { NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID, NEXT_PUBLIC_HIGHLIGHT_SERVICE_NAME } from "../constants";

export function parseResolvedUrl(resolvedUrl: string): string {
    // if resolvedUrl is `/static/[host]/[...slug]` or `/dynamic/[host]/[..slug]` then return '/[...slug]`
    const match = resolvedUrl.match(/\/(static|dynamic)\/[^/]+(.*)/);
    return match?.[2] ?? resolvedUrl;
}

// export const getServerSideProps: GetServerSideProps = async ({ req, res, resolvedUrl, query }) => {
//     if (
//         res.statusCode >= 500 &&
//         res.statusCode < 600 &&
//         req.url != null &&
//         resolvedUrl.startsWith("/static") &&
//         query.error !== "true"
//     ) {
//         const url = parseResolvedUrl(resolvedUrl);
//         return {
//             redirect: {
//                 destination: `${url}${url.includes("?") ? "&" : "?"}error=true`,
//                 permanent: false,
//             },
//         };
//     }
//     return {
//         props: { errorCode: res.statusCode },
//     };
// };

// This is for capturing SSR errors
export default pageRouterCustomErrorHandler(
    {
        // This is just the same config as the error NextApp has
        // TODO(armando): we should have a shared config for this
        projectId: NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
        serviceName: NEXT_PUBLIC_HIGHLIGHT_SERVICE_NAME,
        tracingOrigins: true,
        environment: process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev",
    },
    (props: PageRouterErrorProps) => {
        const router = useRouter();
        // eslint-disable-next-line no-console
        console.error(props.errorMessage);

        if (props.statusCode >= 400 && props.statusCode < 600) {
            void router.replace(parseResolvedUrl(router.asPath) + "?error=true");
        }

        return <Error {...props} />;
    },
);
