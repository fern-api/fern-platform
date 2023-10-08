import { useEffect, useState } from "react";

export function useLayoutBreakpoint(): "sm" | "md" | "lg" {
    const [layoutBreakpoint, setBreakpoint] = useState<"sm" | "md" | "lg">("sm");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleResize = () => {
                if (window.innerWidth < 768) {
                    setBreakpoint("sm");
                } else if (window.innerWidth < 1024) {
                    setBreakpoint("md");
                } else {
                    setBreakpoint("lg");
                }
            };

            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }
        return;
    }, []);

    return layoutBreakpoint;
}
