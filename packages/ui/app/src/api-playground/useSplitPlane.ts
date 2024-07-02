import { useCallback, useState } from "react";

export function useVerticalSplitPane(setHeight: (height: number) => void): {
    handleVerticalResize: (e: React.MouseEvent<HTMLDivElement>) => void;
    isResizing: boolean;
} {
    const [isResizing, setIsResizing] = useState(false);
    const handleVerticalResize = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const handleMouseMove = (e: MouseEvent | TouchEvent) => {
                if (e instanceof MouseEvent) {
                    setHeight(e.clientY);
                    setIsResizing(true);
                }
            };
            const handleMouseUp = () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                setIsResizing(false);
            };
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        },
        [setHeight],
    );
    return { handleVerticalResize, isResizing };
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
