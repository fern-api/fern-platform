import React from "react";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function useMinWidth(breakpoint: number): boolean {
  const [largerThanBreakpoint, setLargerThanBreakpoint] =
    React.useState<boolean>(() =>
      typeof window === "undefined" ? true : window.innerWidth >= breakpoint
    );

  useIsomorphicLayoutEffect(() => {
    requestAnimationFrame(() => {
      window.innerWidth >= breakpoint;
    });

    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const onChange = (e: MediaQueryListEvent) => {
      setLargerThanBreakpoint(e.matches);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return !!largerThanBreakpoint;
}

export function useIsMobile(): boolean {
  return !useMinWidth(MOBILE_BREAKPOINT);
}

export function useIsDesktop(): boolean {
  return useMinWidth(DESKTOP_BREAKPOINT);
}
