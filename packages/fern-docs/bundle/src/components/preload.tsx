"use client";

import type { PreloadOptions } from "react-dom";

export interface PreloadHref {
  href: string;
  options: PreloadOptions;
}

export default function Preload({ href, options }: PreloadHref) {
  return (
    <link
      rel="preload"
      href={href}
      as={options.as}
      crossOrigin={options.crossOrigin}
      fetchPriority={options.fetchPriority}
      imageSizes={options.imageSizes}
      imageSrcSet={options.imageSrcSet}
      integrity={options.integrity}
      nonce={options.nonce}
      referrerPolicy={options.referrerPolicy}
      type={options.type}
    />
  );
}
