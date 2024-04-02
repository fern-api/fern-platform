import cn from "clsx";
import { Children, ComponentProps, PropsWithChildren, ReactElement, useCallback, useRef, useState } from "react";
import { useHorizontalSplitPane, useVerticalSplitPane } from "./useSplitPlane";

interface VerticalSplitPaneProps extends ComponentProps<"div"> {
    aboveClassName?: string;
    belowClassName?: string;
}

export function VerticalSplitPane({
    className,
    aboveClassName,
    belowClassName,
    children,
    ...props
}: PropsWithChildren<VerticalSplitPaneProps>): ReactElement | null {
    const [aboveHeightPercent, setAboveHeightPercent] = useState(0.5);

    const ref = useRef<HTMLDivElement>(null);

    const setHeight = useCallback((clientY: number) => {
        if (ref.current != null) {
            const { top, height } = ref.current.getBoundingClientRect();
            setAboveHeightPercent((clientY - top - 6) / height);
        }
    }, []);

    const handleVerticalResize = useVerticalSplitPane(setHeight);

    const [above, below] = Children.toArray(children);

    if (above == null) {
        return null;
    }

    if (below == null) {
        return (
            <div className={cn("flex flex-col justify-stretch", className)} {...props}>
                <div className={cn(aboveClassName, "flex-1")} style={{ height: "100%" }}>
                    {above}
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className={cn("flex flex-col justify-stretch", className)} {...props}>
            <div style={{ height: `${aboveHeightPercent * 100}%` }} className={cn(aboveClassName, "shrink-0")}>
                {above}
            </div>
            <div
                className="shink-0 group relative flex h-3 flex-none cursor-row-resize items-center px-3 opacity-0 transition-opacity after:absolute after:inset-x-0 after:-top-1 after:h-6 after:content-[''] hover:opacity-100 hover:delay-300"
                onMouseDown={handleVerticalResize}
            >
                <div className="bg-border-primary group-active:bg-accent relative z-10 mx-auto h-0.5 w-full rounded-full group-active:transition-[background]" />
            </div>
            <div className={cn(belowClassName, "flex-1 shrink min-h-0")}>{below}</div>
        </div>
    );
}

interface HorizontalSplitPaneProps extends ComponentProps<"div"> {
    leftClassName?: string;
    rightClassName?: string;
    rizeBarHeight?: number;
}

export function HorizontalSplitPane({
    className,
    leftClassName,
    rightClassName,
    children,
    rizeBarHeight,
    ...props
}: PropsWithChildren<HorizontalSplitPaneProps>): ReactElement | null {
    const [leftHeightPercent, setLeftHeightPercent] = useState(0.6);

    const ref = useRef<HTMLDivElement>(null);

    const setWidth = useCallback((clientX: number) => {
        if (ref.current != null) {
            const { left, width } = ref.current.getBoundingClientRect();
            setLeftHeightPercent((clientX - left - 6) / width);
        }
    }, []);

    const handleVerticalResize = useHorizontalSplitPane(setWidth);

    const [left, right] = Children.toArray(children);

    if (left == null) {
        return null;
    }

    if (right == null) {
        return (
            <div className={className}>
                <div style={{ width: "100%" }} className={className}>
                    {left}
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className={cn("flex justify-stretch shrink", className)} {...props}>
            <div style={{ width: `${leftHeightPercent * 100}%` }} className={cn(leftClassName, "shrink-0")}>
                {left}
            </div>
            <div
                className="shink-0 group sticky top-0 z-10 flex w-3 flex-none cursor-col-resize items-center justify-center py-8 opacity-0 transition-opacity after:absolute after:inset-y-0 after:-left-1 after:w-6 after:content-[''] hover:opacity-100 hover:delay-300"
                onMouseDown={handleVerticalResize}
                style={{ height: rizeBarHeight }}
            >
                <div className="bg-border-primary group-active:bg-accent relative z-10 h-full w-0.5 rounded-full group-active:transition-[background]" />
            </div>
            <div className={cn(rightClassName, "flex-1 shrink min-w-0 relative")}>{right}</div>
        </div>
    );
}
