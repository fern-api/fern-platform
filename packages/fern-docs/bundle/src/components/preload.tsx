"use client";

import ReactDOM from "react-dom";

export interface PreloadHref {
  href: string;
  options: ReactDOM.PreloadOptions;
}

export default function Preload({ href, options }: PreloadHref) {
  ReactDOM.preload(href, options);
  return null;
}
