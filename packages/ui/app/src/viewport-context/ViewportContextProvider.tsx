import { PropsWithChildren, useEffect, useState } from "react";
import { ViewportContext } from "./ViewportContext";

export const ViewportContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
    const [layoutBreakpoint, setBreakpoint] = useState<"sm" | "md" | "lg">("lg");
    const [viewportSize, setViewportSize] = useState<{ height: number; width: number }>({ height: 0, width: 0 });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleResize = () => {
                setViewportSize({
                    height: window.innerHeight,
                    width: document.body.scrollWidth,
                });

                if (window.innerWidth < 768) {
                    setBreakpoint("sm");
                } else if (window.innerWidth < 1024) {
                    setBreakpoint("md");
                } else {
                    setBreakpoint("lg");
                }
            };

            window.addEventListener("resize", handleResize);

            handleResize();
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }
        return;
    }, []);

    return <ViewportContext.Provider value={{ layoutBreakpoint, viewportSize }}>{children}</ViewportContext.Provider>;
};
