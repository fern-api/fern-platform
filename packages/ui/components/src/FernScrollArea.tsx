import * as ScrollArea from "@radix-ui/react-scroll-area";
import clsx from "clsx";
import { forwardRef, PropsWithChildren, RefObject } from "react";

export declare namespace FernScrollArea {
    interface FernScrollAreaProps extends ScrollArea.ScrollAreaProps, Omit<ScrollArea.ScrollAreaViewportProps, "dir"> {
        className?: string;
        rootClassName?: string;
        rootRef?: RefObject<HTMLDivElement>;
        scrollbars?: "both" | "vertical" | "horizontal";
    }

    export type Props = PropsWithChildren<FernScrollAreaProps>;
}

export const FernScrollArea = forwardRef<HTMLDivElement, FernScrollArea.Props>((props, ref) => {
    const {
        children,
        className,
        rootClassName,
        rootRef,
        scrollbars = "both",
        type,
        dir,
        scrollHideDelay = type !== "scroll" ? 0 : undefined,
        ...viewportProps
    } = props;
    return (
        <ScrollArea.Root
            className={clsx("fern-scroll-area", rootClassName)}
            ref={rootRef}
            type={type}
            dir={dir}
            scrollHideDelay={scrollHideDelay}
        >
            <ScrollArea.Viewport
                ref={ref}
                className={clsx("fern-scroll-area-viewport", className)}
                data-scrollbars={scrollbars}
                {...viewportProps}
            >
                {children}
            </ScrollArea.Viewport>
            {scrollbars !== "horizontal" && (
                <ScrollArea.Scrollbar orientation="vertical" className="fern-scroll-area-scrollbar" forceMount>
                    <ScrollArea.Thumb className="fern-scroll-area-thumb" />
                </ScrollArea.Scrollbar>
            )}
            {scrollbars !== "vertical" && (
                <ScrollArea.Scrollbar orientation="horizontal" className="fern-scroll-area-scrollbar" forceMount>
                    <ScrollArea.Thumb className="fern-scroll-area-thumb" />
                </ScrollArea.Scrollbar>
            )}
            {props.scrollbars !== "vertical" && props.scrollbars !== "horizontal" && (
                <ScrollArea.Corner className="fern-scroll-area-corner" />
            )}
        </ScrollArea.Root>
    );
});

FernScrollArea.displayName = "FernScrollArea";
