import Script from "next/script";

import * as snippet from "@segment/snippet";

export function renderSegmentSnippet(apiKey: string): string {
  const opts = {
    apiKey,
    page: true,
  };
  // Skip rendering the snippet for certain domains
  if (!opts.apiKey) {
    return "";
  }
  if (process.env.NODE_ENV === "development") {
    return snippet.max(opts);
  }
  return snippet.min(opts);
}

function SegmentScript(props: { apiKey: string }) {
  return (
    <Script
      id="segment-script"
      dangerouslySetInnerHTML={{
        __html: renderSegmentSnippet(props.apiKey),
      }}
    />
  );
}

export default SegmentScript;
