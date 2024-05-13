import * as snippet from "@segment/snippet";

const DOMAINS_TO_SKIP = ["someexampledomain.com"];

export function renderSegmentSnippet(): string {
    const opts = {
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
      page: true,
    };
    const domain = window.location.hostname;
    // Filter certain domain/s from segment
    if (DOMAINS_TO_SKIP.includes(domain)) {
        return;
    }
    if (process.env.NODE_ENV === "development") {
      return snippet.max(opts);
    }
    return snippet.min(opts);
  }
