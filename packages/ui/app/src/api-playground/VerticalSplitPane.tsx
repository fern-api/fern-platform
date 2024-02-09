import classNames from "classnames";
import {
    Children,
    DetailedHTMLProps,
    HTMLAttributes,
    PropsWithChildren,
    ReactElement,
    useCallback,
    useRef,
    useState,
} from "react";
import { useHorizontalSplitPane, useVerticalSplitPane } from "./useSplitPlane";

interface VerticalSplitPaneProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
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
            <div className={classNames("flex flex-col justify-stretch", className)} {...props}>
                <div className={classNames(aboveClassName, "flex-1")} style={{ height: "100%" }}>
                    {above}
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className={classNames("flex flex-col justify-stretch", className)} {...props}>
            <div style={{ height: `${aboveHeightPercent * 100}%` }} className={classNames(aboveClassName, "shrink-0")}>
                {above}
            </div>
            <div
                className="shink-0 group relative flex h-3 flex-none cursor-row-resize items-center px-3 opacity-0 transition-opacity after:absolute after:inset-x-0 after:-top-3 after:h-10 after:content-[''] hover:opacity-100 hover:delay-300"
                onMouseDown={handleVerticalResize}
            >
                <div className="bg-accent relative z-30 mx-auto h-1 w-10 rounded-sm" />
            </div>
            <div className={classNames(belowClassName, "flex-1")}>{below}</div>
        </div>
    );
}

interface HorizontalSplitPaneProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
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
    const [leftHeightPercent, setLeftHeightPercent] = useState(0.5);

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
        <div ref={ref} className={classNames("flex justify-stretch", className)} {...props}>
            <div style={{ width: `${leftHeightPercent * 100}%` }} className={classNames(leftClassName, "shrink-0")}>
                {left}
            </div>
            <div
                className="shink-0 after: sticky top-0 z-10 flex w-3 flex-none cursor-col-resize items-center justify-center py-3 opacity-0 transition-opacity after:absolute after:inset-y-0 after:-left-3 after:w-10 after:content-[''] hover:opacity-100 hover:delay-300"
                onMouseDown={handleVerticalResize}
                style={{ height: rizeBarHeight }}
            >
                <div className="bg-accent relative z-30 h-10 w-1 rounded-sm" />
            </div>
            <div className={classNames(rightClassName, "flex-1 shrink min-w-0")}>{right}</div>
        </div>
    );
}
