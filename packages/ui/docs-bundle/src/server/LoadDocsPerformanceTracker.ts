import { FernNavigation } from "@fern-api/fdr-sdk";
import { TRACK_LOAD_DOCS_PERFORMANCE } from "@fern-ui/fern-docs-utils";
import { DocsPage } from "@fern-ui/ui";
import { track } from "@vercel/analytics/server";
import { GetServerSidePropsResult } from "next/types";
import { ComponentProps } from "react";
import { AuthPartner } from "./authProps";
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
        private host: string,
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
        return track(TRACK_LOAD_DOCS_PERFORMANCE, {
            host: this.host,
            slug: this.slug,
            auth: this.auth ?? null,
            loadDocsDurationMs: this.loadDocsDurationMs ?? null,
            initialPropsDurationMs: this.initialPropsDurationMs ?? null,
        });
    }
}
