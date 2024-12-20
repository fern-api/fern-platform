import Head from "next/head";
import Script from "next/script";
import { ReactNode, useEffect } from "react";
import { useSafeListenTrackEvents } from "./use-track";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface Window {
    [key: string]: any;
  }
}

type GAParams = {
  gaId: string;
  dataLayerName?: string;
  debugMode?: boolean;
  nonce?: string;
};

export default function GoogleAnalytics(props: GAParams): ReactNode {
  const { gaId, debugMode, dataLayerName = "dataLayer", nonce } = props;
  useEffect(() => {
    // performance.mark is being used as a feature use signal. While it is traditionally used for performance
    // benchmarking it is low overhead and thus considered safe to use in production and it is a widely available
    // existing API.
    // The performance measurement will be handled by Chrome Aurora

    performance.mark("mark_feature_usage", {
      detail: {
        feature: "fern-analytics-ga",
      },
    });
  }, []);

  useSafeListenTrackEvents(({ event, properties }) => {
    sendGAEvent(dataLayerName, { event, properties });
  });

  return (
    <>
      <Head>
        <script
          key="ga"
          id="_fern-ga-init"
          dangerouslySetInnerHTML={{
            __html: `
          window['${dataLayerName}'] = window['${dataLayerName}'] || [];
          function gtag(){window['${dataLayerName}'].push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}' ${debugMode ? ",{ 'debug_mode': true }" : ""});`,
          }}
          nonce={nonce}
        />
      </Head>
      <Script
        id="_fern-ga"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        nonce={nonce}
      />
    </>
  );
}

function sendGAEvent(dataLayer: string, ...args: unknown[]): void {
  if (window[dataLayer]) {
    window[dataLayer].push(...args);
  } else {
    console.warn(`GA dataLayer ${dataLayer} does not exist`);
  }
}
