import Script from "next/script";
import React from "react";

export interface JsConfig {
  remote:
    | {
        url: string;
        strategy:
          | "beforeInteractive"
          | "afterInteractive"
          | "lazyOnload"
          | undefined;
      }[]
    | undefined;
  inline: string[] | undefined;
}

export function JavascriptProvider({ config }: { config: JsConfig }) {
  return (
    <>
      {config.inline?.map((inline, idx) => (
        <Script key={`inline-script-${idx}`} id={`inline-script-${idx}`}>
          {inline}
        </Script>
      ))}
      {config.remote?.map((remote) => (
        <Script
          key={remote.url}
          src={remote.url}
          strategy={remote.strategy}
          type="module"
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}
