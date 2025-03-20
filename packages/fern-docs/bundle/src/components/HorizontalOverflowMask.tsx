import React, { PropsWithChildren, useEffect, useRef, useState } from "react";

import { composeRefs } from "@radix-ui/react-compose-refs";
import fastdom from "fastdom";
import { noop } from "ts-essentials";

import { cn } from "@fern-docs/components";

export const HorizontalOverflowMask = React.forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ className?: string }>
>(function HorizontalOverflowMask({ children, className }, forwardedRef) {
  const ref = useRef<HTMLDivElement>(null);

  const [showLeftMask, setShowLeftMask] = useState(false);
  const [hideRightMask, setHideRightMask] = useState(false);

  // check if overflow is visible
  useEffect(() => {
    const refCurrent = ref.current;

    if (refCurrent == null) {
      return;
    }
    let stopMeasuring = noop;
    const measure = () => {
      fastdom.clear(stopMeasuring);
      stopMeasuring = fastdom.measure(() => {
        // check if scrolled to right > 0px
        setShowLeftMask(refCurrent.scrollLeft >= 3);

        // check if scrolled all the way to the right
        setHideRightMask(
          refCurrent.scrollLeft >=
            refCurrent.scrollWidth - refCurrent.clientWidth - 3
        );
      });
    };

    refCurrent.addEventListener("scroll", measure);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(refCurrent);

    return () => {
      refCurrent.removeEventListener("scroll", measure);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={composeRefs(ref, forwardedRef)}
      className={cn(
        "fern-x-overflow",
        {
          ["left-mask"]: showLeftMask,
          ["right-mask"]: !hideRightMask,
        },
        className
      )}
    >
      {children}
    </div>
  );
});
