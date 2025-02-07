"use client";

import { useAtomValue } from "jotai";
import Script from "next/script";
import { memo } from "react";
import { JS_ATOM } from "../atoms";

export const JavascriptProvider = memo(() => {
  const js = useAtomValue(JS_ATOM);

  if (!js) {
    return false;
  }

  return (
    <>
      {js?.inline?.map((inline, idx) => (
        <Script key={`inline-script-${idx}`} id={`inline-script-${idx}`}>
          {inline}
        </Script>
      ))}
      {js?.remote?.map((remote) => (
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
});

JavascriptProvider.displayName = "JavascriptProvider";
