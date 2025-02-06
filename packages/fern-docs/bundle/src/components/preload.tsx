"use client";

import ReactDOM from "react-dom";

export interface PreloadHref {
  href: string;
  options: ReactDOM.PreloadOptions;
}

export default function Preload({ hrefs }: { hrefs: PreloadHref[] }) {
  hrefs.forEach((href) => {
    ReactDOM.preload(href.href, href.options);
  });

  return false;
}
