import { PropsWithChildren, useEffect, useState } from "react";
import { LayoutBreakpoint } from "./LayoutBreakpoint";

/*
theme: {
    screens: {
        'sm': '640px',
        // => @media (min-width: 640px) { ... }

        'md': '768px',
        // => @media (min-width: 768px) { ... }

        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }

        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
    }
}
*/

export const LayoutBreakpointProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
    const [layoutBreakpoint, setBreakpoint] = useState<"mobile" | "sm" | "md" | "lg" | "xl" | "2xl">("lg");

    useEffect(() => {
        if (window == null) {
            return;
        }

        const mobile = window.matchMedia("(max-width: 639px)");
        const sm = window.matchMedia("(min-width: 640px)");
        const md = window.matchMedia("(min-width: 768px)");
        const lg = window.matchMedia("(min-width: 1024px)");
        const xl = window.matchMedia("(min-width: 1280px)");
        const xxl = window.matchMedia("(min-width: 1536px)");

        const handleBreakpointChange = () => {
            setBreakpoint(() => {
                if (xxl.matches) {
                    return "2xl";
                } else if (xl.matches) {
                    return "xl";
                } else if (lg.matches) {
                    return "lg";
                } else if (md.matches) {
                    return "md";
                } else if (sm.matches) {
                    return "sm";
                } else if (mobile.matches) {
                    return "mobile";
                } else {
                    return "lg";
                }
            });
        };

        handleBreakpointChange();

        mobile.addEventListener("change", handleBreakpointChange);
        sm.addEventListener("change", handleBreakpointChange);
        md.addEventListener("change", handleBreakpointChange);
        lg.addEventListener("change", handleBreakpointChange);
        xl.addEventListener("change", handleBreakpointChange);
        xxl.addEventListener("change", handleBreakpointChange);
        return () => {
            mobile.removeEventListener("change", handleBreakpointChange);
            sm.removeEventListener("change", handleBreakpointChange);
            md.removeEventListener("change", handleBreakpointChange);
            lg.removeEventListener("change", handleBreakpointChange);
            xl.removeEventListener("change", handleBreakpointChange);
            xxl.removeEventListener("change", handleBreakpointChange);
        };
    }, []);

    return <LayoutBreakpoint.Provider value={layoutBreakpoint}>{children}</LayoutBreakpoint.Provider>;
};
