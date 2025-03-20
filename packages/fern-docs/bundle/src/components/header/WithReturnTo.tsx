"use client";

import React from "react";
import { useState } from "react";

import { useCurrentPathname } from "@/hooks/use-current-pathname";

export function WithReturnTo({
  queryParam,
  children,
}: {
  queryParam: string;
  children: React.ReactElement<{ href: string }>;
}) {
  const pathname = useCurrentPathname();
  const [href, setHref] = useState(() => pathname);

  React.useEffect(() => {
    try {
      const url = new URL(children.props.href, window.location.origin);
      url.searchParams.set(
        queryParam,
        String(new URL(pathname, window.location.origin))
      );
      setHref(String(url));
    } catch (error) {
      console.error(
        `Failed to set return to query param ${queryParam} for ${pathname}`,
        error
      );
      setHref(children.props.href);
    }
  }, [children.props.href, pathname, queryParam]);

  if (href === children.props.href) {
    return children;
  }

  return React.cloneElement(children, { href });
}
