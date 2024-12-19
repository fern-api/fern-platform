import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { ReactElement, useRef } from "react";
import { useCallbackOne } from "use-memo-one";
import {
  DESKTOP_SIDEBAR_OPEN_ATOM,
  DISMISSABLE_SIDEBAR_OPEN_ATOM,
  IS_MOBILE_SCREEN_ATOM,
  useAtomEffect,
  useDismissSidebar,
} from "../atoms";
import { SidebarContainer } from "./SidebarContainer";

const SidebarContainerMotion = motion(SidebarContainer);

const BEZIER_CURVE = [0.16, 1, 0.3, 1];

export function DismissableSidebar({
  className,
}: {
  className?: string;
}): ReactElement {
  const handleDismissSidebar = useDismissSidebar();
  const showSidebar = useAtomValue(DISMISSABLE_SIDEBAR_OPEN_ATOM);
  const sidebarRef = useRef<HTMLElement>(null);
  const duration = useAtomValue(IS_MOBILE_SCREEN_ATOM) ? 0 : 0.18;

  useAtomEffect(
    useCallbackOne((_get, set) => {
      const handleMouseMove = (event: MouseEvent) => {
        set(DESKTOP_SIDEBAR_OPEN_ATOM, (prev) => {
          if (event.clientX < 20) {
            return true;
          } else if (prev && event.target instanceof Node) {
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
    }, [])
  );

  return (
    <AnimatePresence>
      {showSidebar && (
        <motion.div
          className="fixed inset-0 z-20 bg-background/50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, curve: BEZIER_CURVE }}
          onClickCapture={handleDismissSidebar}
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
          transition={{ duration, curve: BEZIER_CURVE }}
        />
      )}
    </AnimatePresence>
  );
}
