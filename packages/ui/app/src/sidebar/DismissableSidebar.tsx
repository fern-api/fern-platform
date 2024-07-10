import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { ReactElement, useEffect, useRef, useState } from "react";
import { MOBILE_SIDEBAR_OPEN_ATOM } from "../atoms/sidebar";
import { IS_MOBILE_SCREEN_ATOM, MOBILE_SIDEBAR_ENABLED_ATOM } from "../atoms/viewport";
import { SidebarContainer } from "./SidebarContainer";

const SidebarContainerMotion = motion(SidebarContainer);

export function DismissableSidebar({ className }: { className?: string }): ReactElement {
    const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
    const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useAtom(MOBILE_SIDEBAR_OPEN_ATOM);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);

    const sidebarRef = useRef<HTMLElement>(null);

    // if cursor hovers over the left edge of the screen, open the sidebar, and close it when the cursor leaves the sidebar
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setIsDesktopSidebarOpen((prev) => {
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
        };
    }, []);

    const showSidebar = isMobileSidebarEnabled ? isMobileSidebarOpen : isDesktopSidebarOpen;

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
