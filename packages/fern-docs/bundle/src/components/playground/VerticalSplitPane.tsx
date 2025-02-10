"use client";

import {
  Children,
  ComponentProps,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useRef,
  useState,
} from "react";

import cn, { clsx } from "clsx";

import { useResizeX, useResizeY } from "./useSplitPlane";

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
}: PropsWithChildren<VerticalSplitPaneProps>): ReactElement<any> | null {
  const [aboveHeightPercent, setAboveHeightPercent] = useState(0.5);

  const ref = useRef<HTMLDivElement>(null);

  const setClientY = useCallback((clientY: number) => {
    if (ref.current != null) {
      const { top, height } = ref.current.getBoundingClientRect();
      setAboveHeightPercent((clientY - top - 6) / height);
    }
  }, []);

  const resizeY = useResizeY(setClientY);

  const [above, below] = Children.toArray(children);

  if (above == null) {
    return null;
  }

  if (below == null) {
    return (
      <div
        className={cn("flex flex-col justify-stretch", className)}
        {...props}
      >
        <div
          className={cn(aboveClassName, "flex-1")}
          style={{ height: "100%" }}
        >
          {above}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("flex flex-col justify-stretch", className)}
      {...props}
    >
      <div
        style={{ height: `${aboveHeightPercent * 100}%` }}
        className={cn(aboveClassName, "shrink-0")}
      >
        {above}
      </div>
      <div
        className="shink-0 group relative flex h-3 flex-none cursor-row-resize touch-none items-center px-3 opacity-0 transition-opacity after:absolute after:inset-x-0 after:-top-1 after:h-6 after:content-[''] hover:opacity-100 hover:delay-300"
        onMouseDown={resizeY.onMouseDown}
        onTouchStart={resizeY.onTouchStart}
      >
        <div className="bg-border-primary group-active:bg-accent relative z-10 mx-auto h-0.5 w-full rounded-full group-active:transition-[background]" />
      </div>
      <div className={cn(belowClassName, "min-h-0 flex-1 shrink")}>{below}</div>
    </div>
  );
}

interface HorizontalSplitPaneProps extends ComponentProps<"div"> {
  leftClassName?: string;
  rightClassName?: string;
  rizeBarHeight?: number;
  mode?: "pixel" | "percent";
  initialLeftWidth?: number;
}

export function HorizontalSplitPane({
  className,
  leftClassName,
  rightClassName,
  children,
  rizeBarHeight,
  mode = "percent",
  initialLeftWidth = mode === "percent" ? 0.5 : 300,
  ...props
}: PropsWithChildren<HorizontalSplitPaneProps>): ReactElement<any> | null {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);

  const ref = useRef<HTMLDivElement>(null);

  const setWidth = useCallback(
    (clientX: number) => {
      if (ref.current != null) {
        const { left, width } = ref.current.getBoundingClientRect();
        setLeftWidth(
          mode === "percent" ? (clientX - left - 6) / width : clientX - left - 6
        );
      }
    },
    [mode]
  );

  const resizeX = useResizeX(setWidth);

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
    <div
      ref={ref}
      className={cn("flex shrink justify-stretch", className)}
      {...props}
    >
      <div
        style={{
          width: mode === "percent" ? `${leftWidth * 100}%` : `${leftWidth}px`,
        }}
        className={cn(leftClassName, "shrink-0")}
      >
        {left}
      </div>
      <div
        className={clsx(
          "shink-0 group sticky top-0 z-10 flex w-3 flex-none cursor-col-resize touch-none items-center justify-center opacity-0 transition-opacity after:absolute after:inset-y-0 after:-left-1 after:w-6 after:content-[''] hover:opacity-100 hover:delay-300",
          {
            "py-8": rizeBarHeight != null,
            "-mx-1.5": rizeBarHeight == null,
          }
        )}
        onMouseDown={resizeX.onMouseDown}
        onTouchStart={resizeX.onTouchStart}
        style={{ height: rizeBarHeight ?? "100%" }}
      >
        <div className="bg-border-primary group-active:bg-accent relative z-10 h-full w-0.5 rounded-full group-active:transition-[background]" />
      </div>
      <div className={cn(rightClassName, "relative min-w-0 flex-1 shrink")}>
        {right}
      </div>
    </div>
  );
}
