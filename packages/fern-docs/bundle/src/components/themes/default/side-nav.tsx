"use client";

import { cn } from "@fern-docs/components";
import { useIsDesktop } from "@fern-ui/react-commons";

import { BgImageGradient } from "@/components/BgImageGradient";

import { MobileMenu } from "./mobile-menu";

export function SideNav({
  children,
  fixed = false,
}: {
  children: React.ReactNode;
  fixed?: boolean;
}) {
  const isDesktop = useIsDesktop();

  return (
    <>
      {isDesktop && (
        <aside
          className={cn(
            "pointer-events-auto",
            "z-30",
            "lg:flex lg:shrink-0 lg:translate-x-0 lg:flex-col",
            !fixed &&
              "sticky h-fit max-h-[calc(100dvh-var(--header-height))] border-r-0",
            fixed &&
              "border-border-concealed fixed bottom-0 left-0 border-r backdrop-blur-xl",
            "w-(--spacing-sidebar-width)",
            "top-(--header-height) hidden"
          )}
        >
          {fixed && (
            <div className="clipped-background opacity-70">
              <BgImageGradient className="translate-y-[calc(var(--header-height)*-1)]" />
            </div>
          )}
          {children}
        </aside>
      )}
      {isDesktop && fixed && (
        <aside className="lg:w-(--spacing-sidebar-width) pointer-events-none hidden lg:block lg:shrink-0" />
      )}
      {!isDesktop && <MobileMenu>{children}</MobileMenu>}
    </>
  );
}
