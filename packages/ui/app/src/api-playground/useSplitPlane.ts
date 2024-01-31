import { useCallback } from "react";

export function useVerticalSplitPane(
    setHeight: (height: number) => void
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
        [setHeight]
    );
}

export function useHorizontalSplitPane(
    setWidth: (width: number) => void
): (e: React.MouseEvent<HTMLDivElement>) => void {
    return useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
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
        [setWidth]
    );
}
