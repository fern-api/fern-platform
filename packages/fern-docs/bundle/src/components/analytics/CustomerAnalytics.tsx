"use client";

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
const GoogleAnalytics = dynamic(() => import("./ga"), { ssr: true });
const GoogleTagManager = dynamic(() => import("./gtm"), { ssr: true });

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
  function CustomerAnalytics(): ReactElement<any> | null {
    const domain = useAtomValue(DOMAIN_ATOM);
    const analytics = useAtomValue(ANALYTICS_ATOM);
    const config = useAtomValue(ANALYTICS_CONFIG_ATOM);

    // Prefer values from customer config (if supplied) over legacy Vercel edge config
    const ga4 = config.ga4 != null ? config.ga4 : analytics.ga4;
    const gtm =
      config.gtm != null ? config.gtm.containerId : analytics.gtm?.tagId;

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
        {ga4 != null && <GoogleAnalytics gaId={ga4.measurementId} />}
        {gtm != null && <GoogleTagManager gtmId={gtm} />}
      </>
    );
  }
);
