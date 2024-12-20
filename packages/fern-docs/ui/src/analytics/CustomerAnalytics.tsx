import { DocsV1Read } from "@fern-api/fdr-sdk";
import { isEqual } from "es-toolkit/predicate";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import dynamic from "next/dynamic";
import Script from "next/script";
import { ReactElement, memo } from "react";
import {
  DOCS_ATOM,
  DOMAIN_ATOM,
  DocsProps,
  EMPTY_ANALYTICS_CONFIG,
} from "../atoms";
import { Posthog } from "./PosthogContainer";
import { renderSegmentSnippet } from "./segment";

const IntercomScript = dynamic(() =>
  import("./IntercomScript").then((mod) => mod.IntercomScript)
);
const FullstoryScript = dynamic(() =>
  import("./FullstoryScript").then((mod) => mod.FullstoryScript)
);
const GoogleAnalytics = dynamic(() =>
  import("@next/third-parties/google").then((mod) => mod.GoogleAnalytics)
);
const GoogleTagManager = dynamic(() =>
  import("@next/third-parties/google").then((mod) => mod.GoogleTagManager)
);

const ANALYTICS_ATOM = selectAtom(
  DOCS_ATOM,
  (docs) => docs.analytics ?? {},
  isEqual
);
const ANALYTICS_CONFIG_ATOM = selectAtom<DocsProps, DocsV1Read.AnalyticsConfig>(
  DOCS_ATOM,
  (docs) => docs.analyticsConfig ?? EMPTY_ANALYTICS_CONFIG,
  isEqual
);

export const CustomerAnalytics = memo(
  function CustomerAnalytics(): ReactElement | null {
    const domain = useAtomValue(DOMAIN_ATOM);
    const { ga4, gtm } = useAtomValue(ANALYTICS_ATOM);
    const config = useAtomValue(ANALYTICS_CONFIG_ATOM);

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

        {/* renders Google Analytics 4 or Google Tag Manager using @next/third-parties */}
        {ga4 != null && <GoogleAnalytics gaId={ga4.measurementId} />}
        {gtm != null && <GoogleTagManager gtmId={gtm.tagId} />}
      </>
    );
  }
);
