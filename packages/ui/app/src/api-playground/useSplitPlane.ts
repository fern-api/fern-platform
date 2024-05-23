import { useCallback, useEffect, useState } from "react";

export function useWindowHeight(): number | undefined {
    const [windowHeight, setWindowHeight] = useState<number | undefined>(undefined);
    useEffect(() => {
        if (window == null) {
            return;
        }

        setWindowHeight(window.innerHeight);

        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return windowHeight;
}

export function useWindowWidth(): number | undefined {
    const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);
    useEffect(() => {
        if (window == null) {
            return;
        }

        setWindowWidth(window.innerWidth);

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return windowWidth;
}

export function useVerticalSplitPane(
    setHeight: (height: number) => void,
): (e: React.MouseEvent<HTMLDivElement>) => void {
    return useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const handleMouseMove = (e: MouseEvent | TouchEvent) => {
                if (e instanceof MouseEvent) {
                    setHeight(e.clientY);
                }
            };
            const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        },
        [setHeight],
    );
}

export function useHorizontalSplitPane(
    setWidth: (width: number) => void,
): (e: React.MouseEvent<HTMLDivElement>) => void {
    return useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            // disable if the event is not a left click
            if (e.button !== 0) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            const handleMouseMove = (e: MouseEvent | TouchEvent) => {
                if (e instanceof MouseEvent) {
                    setWidth(e.clientX);
                }
            };
            const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        },
        [setWidth],
    );
}
