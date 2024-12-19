/* eslint-disable no-console */
import { FernNavigation } from "@fern-api/fdr-sdk";
import type { FernUser } from "@fern-docs/auth";
import type { DocsPage } from "@fern-docs/ui";
import type { GetServerSidePropsResult } from "next";
import type { ComponentProps } from "react";
import { LoadDocsPerformanceTracker } from "./LoadDocsPerformanceTracker";
import { loadWithUrl } from "./loadWithUrl";
import { withInitialProps } from "./withInitialProps";

type SSGDocsPageProps = GetServerSidePropsResult<
    ComponentProps<typeof DocsPage>
>;

export interface User {
    isAuthenticated: boolean;
    user?: FernUser;
}

export async function getDocsPageProps(
    domain: string | undefined,
    host: string,
    slug: FernNavigation.Slug,
    fern_token?: string | undefined
): Promise<SSGDocsPageProps> {
    if (typeof domain !== "string") {
        return { notFound: true };
    }

    const performance = LoadDocsPerformanceTracker.init({ domain, slug });

    /**
     * Load the docs for the given URL.
     */
    const docs = await performance.trackLoadDocsPromise(loadWithUrl(domain));
    console.log("Loaded docs from url");

    /**
     * Convert the docs into initial props for the page.
     */
    const initialProps = await performance.trackInitialPropsPromise(
        withInitialProps({ docs, slug, domain, host, fern_token })
    );
    console.log("Converted docs into initial props");

    /**
     * Send performance data to PostHog.
     */
    await performance.track();

    return initialProps;
}
