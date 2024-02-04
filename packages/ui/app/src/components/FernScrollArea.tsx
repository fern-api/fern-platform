import * as ScrollArea from "@radix-ui/react-scroll-area";
import classNames from "classnames";
import { forwardRef, PropsWithChildren } from "react";
import "./FernScrollArea.scss";

interface FernScrollAreaProps extends ScrollArea.ScrollAreaProps {
    className?: string;
    viewportClassName?: string;
}
export const FernScrollArea = forwardRef<HTMLDivElement, PropsWithChildren<FernScrollAreaProps>>(
    function FernScrollArea({ children, className, viewportClassName, ...props }, ref) {
        return (
            <ScrollArea.Root className={classNames("fern-scroll-area", className)} ref={ref} {...props}>
                <ScrollArea.Viewport className={classNames("fern-scroll-area-viewport", viewportClassName)}>
                    {children}
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="fern-scroll-area-scrollbar">
                    <ScrollArea.Thumb className="fern-scroll-area-thumb" />
                </ScrollArea.Scrollbar>
                <ScrollArea.Scrollbar orientation="horizontal" className="fern-scroll-area-scrollbar">
                    <ScrollArea.Thumb className="fern-scroll-area-thumb" />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>
        );
    },
);
