import type { DocsV1Read } from "@fern-api/fdr-sdk";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Posthog } from "./PosthogContainer";
import { renderSegmentSnippet } from "./segment";

const IntercomScript = dynamic(() =>
  import("./IntercomScript").then((mod) => mod.IntercomScript)
);
const FullstoryScript = dynamic(() =>
  import("./FullstoryScript").then((mod) => mod.FullstoryScript)
);
const GoogleAnalytics = dynamic(() => import("./ga"), { ssr: true });
const GoogleTagManager = dynamic(() => import("./gtm"), { ssr: true });

export function CustomerAnalytics({
  domain,
  config,
}: {
  domain: string;
  config: DocsV1Read.AnalyticsConfig;
}) {
  return (
    <>
      {/* renders either segment with our write key or segment with the customer's write key */}
      <Script
        id="segment-script"
        dangerouslySetInnerHTML={{
          __html: renderSegmentSnippet(domain, config.segment?.writeKey),
        }}
      />
      <Posthog customerConfig={config.posthog} />
      <IntercomScript config={config.intercom} />
      <FullstoryScript config={config.fullstory} />

      {/* renders Google Analytics 4 or Google Tag Manager */}
      {config.ga4 && <GoogleAnalytics gaId={config.ga4.measurementId} />}
      {config.gtm && <GoogleTagManager gtmId={config.gtm.containerId} />}
    </>
  );
}
