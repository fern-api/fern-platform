"use client";

import { useEffect } from "react";
import ReactDOM from "react-dom";

export interface PreloadHref {
  href: string;
  options: ReactDOM.PreloadOptions;
}

export default function Preload({ href, options }: PreloadHref) {
  useEffect(() => {
    ReactDOM.preload(href, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href]);

  return false;
}
