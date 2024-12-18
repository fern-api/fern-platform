import { Dispatch, SetStateAction, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

export function useCmdkShortcut(setOpen: Dispatch<SetStateAction<boolean>>): void {
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isMobile) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            setOpen((prev) => {
                if (prev) {
                    return prev;
                }

                if (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key === "k")) {
                    event.preventDefault();
                    return true;
                }

                return prev;
            });
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return () => {
            window.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [isMobile, setOpen]);
}
