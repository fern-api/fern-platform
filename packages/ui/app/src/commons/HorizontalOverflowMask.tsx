import cn from "clsx";
import React, { PropsWithChildren, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./HorizontalOverflowMask.css";

export const HorizontalOverflowMask = React.forwardRef<HTMLDivElement, PropsWithChildren<{ className?: string }>>(
    function HorizontalOverflowMask({ children, className }, parentRef) {
        const ref = useRef<HTMLDivElement>(null);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        useImperativeHandle(parentRef, () => ref.current!);

        const [showLeftMask, setShowLeftMask] = useState(false);
        const [hideRightMask, setHideRightMask] = useState(() =>
            ref.current != null ? ref.current.scrollLeft === ref.current.scrollWidth - ref.current.clientWidth : false,
        );

        const [nonce, setNonce] = useState(0);

        // force measurement on mount
        useEffect(() => setNonce((n) => n + 1), []);

        // check if overflow is visible
        useEffect(() => {
            const refCurrent = ref.current;

            if (refCurrent == null) {
                return;
            }
            const measure = () => {
                // check if scrolled to right > 0px
                setShowLeftMask(refCurrent.scrollLeft >= 3);

                // check if scrolled all the way to the right
                setHideRightMask(refCurrent.scrollLeft >= refCurrent.scrollWidth - refCurrent.clientWidth - 3);
            };

            refCurrent.addEventListener("scroll", measure);

            measure();
            const resizeObserver = new ResizeObserver(measure);
            resizeObserver.observe(refCurrent);

            return () => {
                refCurrent.removeEventListener("scroll", measure);
                resizeObserver.disconnect();
            };
        }, [nonce]);

        return (
            <div
                ref={ref}
                className={cn(
                    "fern-x-overflow",
                    {
                        ["left-mask"]: showLeftMask,
                        ["right-mask"]: !hideRightMask,
                    },
                    className,
                )}
            >
                {children}
            </div>
        );
    },
);
