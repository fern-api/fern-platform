import { useServerInsertedHTML } from "next/navigation";
import { ReactNode, useEffect } from "react";
import React from "react";

import { useSafeListenTrackEvents } from "./use-track";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface Window {
    [key: string]: any;
  }
}

type GTMParams = {
  gtmId: string;
  dataLayerName?: string;
  nonce?: string;
};

export default function GoogleTagManager(props: GTMParams): ReactNode {
  const { gtmId, dataLayerName = "dataLayer", nonce } = props;

  useEffect(() => {
    // performance.mark is being used as a feature use signal. While it is traditionally used for performance
    // benchmarking it is low overhead and thus considered safe to use in production and it is a widely available
    // existing API.
    // The performance measurement will be handled by Chrome Aurora

    performance.mark("mark_feature_usage", {
      detail: {
        feature: "fern-analytics-gtm",
      },
    });
  }, []);

  useSafeListenTrackEvents(({ event, properties }) => {
    sendGTMEvent(dataLayerName, { event, properties });
  });

  const inserted = React.useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <script
        key="ga"
        id="_fern-gtm"
        defer
        dangerouslySetInnerHTML={{
          __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='${dataLayerName}'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','${dataLayerName}','${gtmId}');
`,
        }}
        nonce={nonce}
      />
    );
  });

  return (
    <noscript nonce={nonce} id="_fern-gtm-noscript">
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        nonce={nonce}
      />
    </noscript>
  );
}

export const sendGTMEvent = (dataLayer: string, data: unknown): void => {
  // define dataLayer so we can still queue up events before GTM init
  window[dataLayer] = window[dataLayer] || [];
  window[dataLayer].push(data);
};
