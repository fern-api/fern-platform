import { useLayoutEffect, useState } from "react";

export function useViewportSize(): { width: number; height: number } {
    const [width, setViewportWidth] = useState<number>(() =>
        typeof window !== "undefined" ? window.innerWidth : 0
    );
    const [height, setViewportHeight] = useState<number>(() =>
        typeof window !== "undefined" ? window.innerHeight : 0
    );

    if (typeof window !== "undefined") {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useLayoutEffect(() => {
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
    }

    return { width, height };
}
