import { useAtomValue } from "jotai/react";
import { atom } from "jotai/vanilla";

export const WINDOW_HEIGHT_ATOM = atom(0);
WINDOW_HEIGHT_ATOM.onMount = (setHeight) => {
    if (typeof window === "undefined") {
        return;
    }
    setHeight(window.innerHeight);
    const handleResize = () => {
        setHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
        window.removeEventListener("resize", handleResize);
    };
};
export function useWindowHeight(): number {
    return useAtomValue(WINDOW_HEIGHT_ATOM);
}

// export const WINDOW_WIDTH_ATOM = atom(0);
// WINDOW_WIDTH_ATOM.onMount = (setWidth) => {
//     if (typeof window === "undefined") {
//         return;
//     }
//     setWidth(window.innerWidth);
//     const handleResize = () => {
//         setWidth(window.innerWidth);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => {
//         window.removeEventListener("resize", handleResize);
//     };
// };
