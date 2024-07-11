import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactElement, useRef } from "react";
import { useCallbackOne } from "use-memo-one";
import { useAtomEffect } from "../atoms";
import { DESKTOP_SIDEBAR_OPEN_ATOM, DISMISSABLE_SIDEBAR_OPEN_ATOM, MOBILE_SIDEBAR_OPEN_ATOM } from "../atoms/sidebar";
import { IS_MOBILE_SCREEN_ATOM } from "../atoms/viewport";
import { SidebarContainer } from "./SidebarContainer";

const SidebarContainerMotion = motion(SidebarContainer);

export function DismissableSidebar({ className }: { className?: string }): ReactElement {
    const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);
    const setIsMobileSidebarOpen = useSetAtom(MOBILE_SIDEBAR_OPEN_ATOM);
    const showSidebar = useAtomValue(DISMISSABLE_SIDEBAR_OPEN_ATOM);

    const sidebarRef = useRef<HTMLElement>(null);

    useAtomEffect(
        useCallbackOne((_get, set) => {
            const handleMouseMove = (event: MouseEvent) => {
                set(DESKTOP_SIDEBAR_OPEN_ATOM, (prev) => {
                    if (event.screenX < 20) {
                        return true;
                    } else if (prev && event.target instanceof HTMLElement) {
                        return sidebarRef.current?.contains(event.target) ?? false;
                    } else {
                        return false;
                    }
                });
            };
            window.addEventListener("mousemove", handleMouseMove);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                set(DESKTOP_SIDEBAR_OPEN_ATOM, false);
            };
        }, []),
    );

    return (
        <AnimatePresence>
            {showSidebar && (
                <motion.div
                    className="inset-0 fixed bg-background/50 z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: isMobileScreen ? 0 : 0.15, curve: [0.16, 1, 0.3, 1] }}
                    onClickCapture={() => setIsMobileSidebarOpen(false)}
                />
            )}
            {showSidebar && (
                <SidebarContainerMotion
                    key="sidebar"
                    ref={sidebarRef}
                    className={clsx("dismissable z-50", className)}
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: isMobileScreen ? 0 : 0.15, curve: [0.16, 1, 0.3, 1] }}
                />
            )}
        </AnimatePresence>
    );
}
