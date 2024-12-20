import cn from "clsx";
import fastdom from "fastdom";
import React, {
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { noop } from "ts-essentials";

export const HorizontalOverflowMask = React.forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ className?: string }>
>(function HorizontalOverflowMask({ children, className }, parentRef) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useImperativeHandle(parentRef, () => ref.current!);

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
      ref={ref}
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
