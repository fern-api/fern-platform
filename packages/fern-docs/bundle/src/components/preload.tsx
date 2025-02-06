"use client";

import ReactDOM from "react-dom";

export interface PreloadHref {
  href: string;
  options: ReactDOM.PreloadOptions;
}

export default function Preload({ href, options }: PreloadHref) {
  // useEffect(() => {
  //   ReactDOM.preload(href, options);
  // }, [href]);
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
