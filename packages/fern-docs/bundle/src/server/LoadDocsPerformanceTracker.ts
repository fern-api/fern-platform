import { track } from "@/server/analytics/posthog";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { TRACK_LOAD_DOCS_PERFORMANCE } from "@fern-docs/utils";
import { GetServerSidePropsResult } from "next/types";
import type { LoadWithUrlResponse } from "./loadWithUrl";

export class LoadDocsPerformanceTracker {
  static init({
    domain,
    slug,
  }: {
    domain: string;
    slug: FernNavigation.Slug;
  }): LoadDocsPerformanceTracker {
    return new LoadDocsPerformanceTracker(domain, slug);
  }

  private constructor(
    private domain: string,
    private slug: FernNavigation.Slug
  ) {}

  private loadDocsDurationMs: number | undefined;
  async trackLoadDocsPromise(
    promise: Promise<LoadWithUrlResponse>
  ): Promise<LoadWithUrlResponse> {
    const start = Date.now();
    const result = await promise;
    const end = Date.now();
    this.loadDocsDurationMs = end - start;
    return result;
  }

  private initialPropsDurationMs: number | undefined;
  async trackInitialPropsPromise<T>(
    promise: Promise<GetServerSidePropsResult<T>>
  ): Promise<GetServerSidePropsResult<T>> {
    const start = Date.now();
    const result = await promise;
    const end = Date.now();
    this.initialPropsDurationMs = end - start;
    return result;
  }

  async track(): Promise<void> {
    const properties = {
      domain: this.domain,
      slug: this.slug,
      loadDocsDurationMs: this.loadDocsDurationMs,
      initialPropsDurationMs: this.initialPropsDurationMs,
      $current_url: `https://${this.domain}/${this.slug}`,
    };

    console.log(TRACK_LOAD_DOCS_PERFORMANCE, properties);

    await track(TRACK_LOAD_DOCS_PERFORMANCE, properties);
  }
}
