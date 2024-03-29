import * as ScrollArea from "@radix-ui/react-scroll-area";
import cn from "clsx";
import { forwardRef, PropsWithChildren, RefObject } from "react";
import "./FernScrollArea.css";

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
        scrollHideDelay,
        ...viewportProps
    } = props;
    return (
        <ScrollArea.Root className={cn("fern-scroll-area", rootClassName)} ref={rootRef}>
            <ScrollArea.Viewport ref={ref} className={cn("fern-scroll-area-viewport", className)} {...viewportProps}>
                {children}
            </ScrollArea.Viewport>
            {scrollbars !== "horizontal" && (
                <ScrollArea.Scrollbar orientation="vertical" className="fern-scroll-area-scrollbar">
                    <ScrollArea.Thumb className="fern-scroll-area-thumb" />
                </ScrollArea.Scrollbar>
            )}
            {scrollbars !== "vertical" && (
                <ScrollArea.Scrollbar orientation="horizontal" className="fern-scroll-area-scrollbar">
                    <ScrollArea.Thumb className="fern-scroll-area-thumb" />
                </ScrollArea.Scrollbar>
            )}
            {props.scrollbars === "both" && <ScrollArea.Corner className="fern-scroll-area-corner" />}
        </ScrollArea.Root>
    );
});

FernScrollArea.displayName = "FernScrollArea";
