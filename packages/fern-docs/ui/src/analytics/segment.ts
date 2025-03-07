import * as snippet from "@segment/snippet";

const DOMAINS_TO_SKIP = ["privategpt.docs.buildwithfern.com"];

export function renderSegmentSnippet(
  domain: string,
  customSegmentWriteKey?: string
): string {
  const opts = {
    apiKey: customSegmentWriteKey,
    page: true,
  };
  // Skip rendering the snippet for certain domains
  if (DOMAINS_TO_SKIP.includes(domain) || !opts.apiKey) {
    return "";
  }
  if (process.env.NODE_ENV === "development") {
    return snippet.max(opts);
  }
  return snippet.min(opts);
}
