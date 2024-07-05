import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { ReactElement, useEffect, useRef, useState } from "react";
import { MOBILE_SIDEBAR_OPEN_ATOM } from "../atoms/sidebar";
import { useLayoutBreakpoint } from "../atoms/viewport";
import { DesktopSidebar } from "./DesktopSidebar";

const DesktopSidebarMotion = motion(DesktopSidebar);

export function DismissableSidebar({ className }: { className?: string }): ReactElement {
    const breakpoint = useLayoutBreakpoint();
    const isMobile = breakpoint.max("lg");
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

    const showSidebar = isMobile ? isMobileSidebarOpen : isDesktopSidebarOpen;

    return (
        <AnimatePresence>
            {showSidebar && (
                <motion.div
                    className="inset-0 fixed bg-background/50 z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, curve: [0.16, 1, 0.3, 1] }}
                    onClickCapture={() => setIsMobileSidebarOpen(false)}
                />
            )}
            {showSidebar && (
                <DesktopSidebarMotion
                    key="sidebar"
                    ref={sidebarRef}
                    className={clsx("dismissable z-50", className)}
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.15, curve: [0.16, 1, 0.3, 1] }}
                />
            )}
        </AnimatePresence>
    );
}
