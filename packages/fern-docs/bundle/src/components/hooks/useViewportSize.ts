import { useLayoutEffect, useState } from "react";

import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

export function useViewportSize(): { width: number; height: number } {
  const [width, setViewportWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [height, setViewportHeight] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      const handleResize = () => {
        setViewportHeight(window.innerHeight);
        setViewportWidth(window.innerWidth);
      };

      handleResize();

      window.addEventListener("resize", handleResize, { passive: true });
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);
  }

  return { width, height };
}

export function useHeaderHeight(): number {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  useIsomorphicLayoutEffect(() => {
    const header = document.getElementById("fern-header");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
    const resizeObserver = new ResizeObserver(() => {
      const header = document.getElementById("fern-header");
      console.log(header);
      if (header) {
        setHeaderHeight(header.clientHeight);
      }
    });
    resizeObserver.observe(document.body);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return headerHeight;
}
