"use client";

import dynamic from "next/dynamic";
import React from "react";

import { DocsV1Read } from "@fern-api/fdr-sdk";

import { PosthogProvider } from "./posthog-provider";

const FullstoryScript = dynamic(() => import("./FullstoryScript"), {
  ssr: true,
});
const GoogleAnalytics = dynamic(() => import("./ga"), { ssr: true });
const GoogleTagManager = dynamic(() => import("./gtm"), { ssr: true });
const IntercomScript = dynamic(() => import("./intercom"), { ssr: true });
const SegmentScript = dynamic(() => import("./segment"), { ssr: true });

export function CustomerAnalytics({
  config,
}: {
  config?: Partial<DocsV1Read.AnalyticsConfig>;
}) {
  if (!config) {
    return null;
  }

  return (
    <>
      <PosthogProvider customerConfig={config.posthog} />
      {config.fullstory && <FullstoryScript config={config.fullstory} />}
      {config.ga4 && <GoogleAnalytics gaId={config.ga4.measurementId} />}
      {config.gtm && <GoogleTagManager gtmId={config.gtm.containerId} />}
      {config.intercom && <IntercomScript config={config.intercom} />}
      {config.segment && <SegmentScript apiKey={config.segment.writeKey} />}
    </>
  );
}
