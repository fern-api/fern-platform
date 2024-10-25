import { FernNavigation } from "@fern-api/fdr-sdk";
import { TRACK_LOAD_DOCS_PERFORMANCE } from "@fern-ui/fern-docs-utils";
import { DocsPage } from "@fern-ui/ui";
import { GetServerSidePropsResult } from "next/types";
import { ComponentProps } from "react";
import { getPosthog } from "./analytics/posthog";
import { AuthPartner } from "./auth/getAuthState";
import type { LoadWithUrlResponse } from "./loadWithUrl";

export class LoadDocsPerformanceTracker {
    static init({
        domain,
        slug,
        auth,
    }: {
        domain: string;
        slug: FernNavigation.Slug;
        auth: AuthPartner | undefined;
    }): LoadDocsPerformanceTracker {
        return new LoadDocsPerformanceTracker(domain, slug, auth);
    }

    private constructor(
        private domain: string,
        private slug: FernNavigation.Slug,
        private auth: AuthPartner | undefined,
    ) {}

    private loadDocsDurationMs: number | undefined;
    async trackLoadDocsPromise(promise: Promise<LoadWithUrlResponse>): Promise<LoadWithUrlResponse> {
        const start = Date.now();
        const result = await promise;
        const end = Date.now();
        this.loadDocsDurationMs = end - start;
        return result;
    }

    private initialPropsDurationMs: number | undefined;
    async trackInitialPropsPromise(
        promise: Promise<GetServerSidePropsResult<ComponentProps<typeof DocsPage>>>,
    ): Promise<GetServerSidePropsResult<ComponentProps<typeof DocsPage>>> {
        const start = Date.now();
        const result = await promise;
        const end = Date.now();
        this.initialPropsDurationMs = end - start;
        return result;
    }

    async track(): Promise<void> {
        const event = {
            event: TRACK_LOAD_DOCS_PERFORMANCE,
            distinctId: this.domain,
            properties: {
                domain: this.domain,
                slug: this.slug,
                url: `https://${this.domain}/${this.slug}`,
                auth: this.auth,
                loadDocsDurationMs: this.loadDocsDurationMs,
                initialPropsDurationMs: this.initialPropsDurationMs,
            },
        };

        // eslint-disable-next-line no-console
        console.log(event);

        try {
            const posthog = getPosthog();

            posthog.capture(event);

            await posthog.shutdown();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }
}
