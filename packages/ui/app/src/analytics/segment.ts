import * as snippet from "@segment/snippet";

export function renderSegmentSnippet(): string {
    const opts = {
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY,
      page: true,
    };
  
    if (process.env.NODE_ENV === "development") {
      return snippet.max(opts);
    }
    return snippet.min(opts);
  }
