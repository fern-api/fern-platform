import { useEffect, useState } from "react";

export function useViewportSize(): { width: number; height: number } {
    const [width, setViewportWidth] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 0));
    const [height, setViewportHeight] = useState<number>(() =>
        typeof window !== "undefined" ? window.innerHeight : 0,
    );

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleResize = () => {
            setViewportHeight(window.innerHeight);
            setViewportWidth(window.innerWidth);
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return {
        width,
        height,
    };
}
