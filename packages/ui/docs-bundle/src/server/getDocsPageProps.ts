import type { FernUser } from "@fern-ui/fern-docs-auth";
import type { DocsPage } from "@fern-ui/ui";
import type { GetServerSidePropsResult } from "next";
import type { ComponentProps } from "react";
import { LoadDocsPerformanceTracker } from "./LoadDocsPerformanceTracker";
import type { AuthProps } from "./authProps";
import { loadWithUrl } from "./loadWithUrl";
import { withInitialProps } from "./withInitialProps";

type SSGDocsPageProps = GetServerSidePropsResult<ComponentProps<typeof DocsPage>>;

export interface User {
    isAuthenticated: boolean;
    user?: FernUser;
}

export async function getDocsPageProps(
    xFernHost: string | undefined,
    slug: string[],
    auth?: AuthProps,
): Promise<SSGDocsPageProps> {
    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { notFound: true };
    }

    const performance = LoadDocsPerformanceTracker.init({ host: xFernHost, slug, auth: auth?.user.partner });

    /**
     * Load the docs for the given URL.
     */
    const docs = await performance.trackLoadDocsPromise(loadWithUrl(xFernHost, auth));

    /**
     * Convert the docs into initial props for the page.
     */
    const initialProps = await performance.trackInitialPropsPromise(withInitialProps({ docs, slug, xFernHost, auth }));

    /**
     * Send performance data to Vercel Analytics.
     */
    await performance.track();

    return initialProps;
}
