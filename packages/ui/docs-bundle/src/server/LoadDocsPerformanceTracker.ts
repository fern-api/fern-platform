import { TRACK_LOAD_DOCS_PERFORMANCE } from "@fern-ui/fern-docs-utils";
import { DocsPage } from "@fern-ui/ui";
import { track } from "@vercel/analytics/server";
import { GetServerSidePropsResult } from "next/types";
import { ComponentProps } from "react";
import type { LoadWithUrlResponse } from "./loadWithUrl";

export class LoadDocsPerformanceTracker {
    static init({
        host,
        slug,
        auth,
    }: {
        host: string;
        slug: string[];
        auth: "workos" | "ory" | "custom" | undefined;
    }): LoadDocsPerformanceTracker {
        return new LoadDocsPerformanceTracker(host, slug, auth);
    }

    private constructor(
        private host: string,
        private slug: string[],
        private auth: "workos" | "ory" | "custom" | undefined,
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
            slug: this.slug.join("/"),
            auth: this.auth ?? null,
            loadDocsDurationMs: this.loadDocsDurationMs ?? null,
            initialPropsDurationMs: this.initialPropsDurationMs ?? null,
        });
    }
}
