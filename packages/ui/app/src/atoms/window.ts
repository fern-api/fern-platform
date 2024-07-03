import fastdom from "fastdom";
import { useAtomValue } from "jotai/react";
import { atom } from "jotai/vanilla";
import { useMemo } from "react";
import { noop } from "ts-essentials";

export const IS_READY_ATOM = atom(false);

IS_READY_ATOM.onMount = (setIsReady) => {
    if (typeof window !== "undefined") {
        setIsReady(true);
    }
};

export function useIsReady(): boolean {
    return useAtomValue(IS_READY_ATOM);
}

let clear = noop;
const WINDOW_SIZE_ATOM = atom<[width: number, height: number]>([0, 0]);
WINDOW_SIZE_ATOM.onMount = (set) => {
    if (typeof window === "undefined") {
        return;
    }
    clear = fastdom.measure(() => {
        set([window.innerWidth, window.innerHeight]);
    });
    const handleResize = () => {
        fastdom.clear(clear);
        clear = fastdom.measure(() => {
            set([window.innerWidth, window.innerHeight]);
        });
    };
    window.addEventListener("resize", handleResize);
    return () => {
        window.removeEventListener("resize", handleResize);
    };
};

export const WINDOW_WIDTH_ATOM = atom((get) => get(WINDOW_SIZE_ATOM)[0]);
export const WINDOW_HEIGHT_ATOM = atom((get) => get(WINDOW_SIZE_ATOM)[1]);

export function useWindowHeight(): number {
    return useAtomValue(WINDOW_HEIGHT_ATOM);
}

export const BREAKPOINTS = [
    "mobile" as const,
    "sm" as const,
    "md" as const,
    "lg" as const,
    "xl" as const,
    "2xl" as const,
];

export type Breakpoint = (typeof BREAKPOINTS)[number];

/*
const mobile = window.matchMedia("(max-width: 639px)");
const sm = window.matchMedia("(min-width: 640px)");
const md = window.matchMedia("(min-width: 768px)");
const lg = window.matchMedia("(min-width: 1024px)");
const xl = window.matchMedia("(min-width: 1280px)");
const xxl = window.matchMedia("(min-width: 1536px)");
*/
const BREAKPOINT_ATOM = atom<Breakpoint>((get) => {
    const windowWidth = get(WINDOW_SIZE_ATOM)[0];
    if (windowWidth > 1536) {
        return "2xl";
    } else if (windowWidth > 1280) {
        return "xl";
    } else if (windowWidth > 1024) {
        return "lg";
    } else if (windowWidth > 768) {
        return "md";
    } else if (windowWidth > 640) {
        return "sm";
    } else {
        return "mobile";
    }
});

export function useLayoutBreakpointValue(): Breakpoint {
    return useAtomValue(BREAKPOINT_ATOM);
}

export interface LayoutBreakpointValue {
    value: Breakpoint;
    min: (bp: Breakpoint) => boolean; // inclusive
    max: (bp: Breakpoint) => boolean; // exclusive
}
export function useLayoutBreakpoint(): LayoutBreakpointValue {
    const layoutBreakpoint = useAtomValue(BREAKPOINT_ATOM);
    return useMemo(
        () => ({
            value: layoutBreakpoint,
            min: (breakpoint: Breakpoint): boolean => {
                const breakpointIndex = BREAKPOINTS.indexOf(breakpoint);
                const currentBreakpointIndex = BREAKPOINTS.indexOf(layoutBreakpoint);
                return currentBreakpointIndex >= breakpointIndex;
            },
            max: (breakpoint: Breakpoint): boolean => {
                const breakpointIndex = BREAKPOINTS.indexOf(breakpoint);
                if (breakpointIndex === 0) {
                    return true;
                }
                const currentBreakpointIndex = BREAKPOINTS.indexOf(layoutBreakpoint);
                return currentBreakpointIndex < breakpointIndex;
            },
        }),
        [layoutBreakpoint],
    );
}

// export const WINDOW_WIDTH_ATOM = atom(0);
// WINDOW_WIDTH_ATOM.onMount = (setWidth) => {
//     if (typeof window === "undefined") {
//         return;
//     }
//     setWidth(window.innerWidth);
//     const handleResize = () => {
//         setWidth(window.innerWidth);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => {
//         window.removeEventListener("resize", handleResize);
//     };
// };
