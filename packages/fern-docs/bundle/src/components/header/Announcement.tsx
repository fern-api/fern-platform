"use client";

import { useServerInsertedHTML } from "next/navigation";
import React from "react";

import { X } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { FernButton, cn } from "@fern-docs/components";

type AnnouncementStore = {
  announcement: string | null;
  dismiss: (announcement: string) => void;
};

export const useAnnouncementStore = create<AnnouncementStore>()(
  persist(
    (set) => ({
      announcement: null,
      dismiss: (announcement: string) => set({ announcement }),
    }),
    {
      name: "fern-announcement-dismissed",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const AnnouncementInternal = React.forwardRef<
  React.ComponentRef<typeof m.div>,
  {
    dismiss: () => void;
    children?: React.ReactNode;
  } & Omit<React.ComponentPropsWithoutRef<typeof m.div>, "children">
>(({ dismiss, className, children, ...props }, forwardedRef) => {
  return (
    <m.div
      suppressHydrationWarning
      ref={forwardedRef}
      {...props}
      className={cn("overflow-hidden", className)}
    >
      <m.div
        className="bg-(color:--accent) text-(color:--accent-contrast) flex min-h-8 items-center px-4 md:px-6 lg:px-8"
        exit={{ y: "-100%" }}
      >
        <div className="max-w-page-width mx-auto flex-1 text-center">
          {children}
        </div>
        <FernButton
          variant="minimal"
          className="absolute right-0"
          icon={<X className="!text-(color:--accent-contrast)" />}
          onClick={dismiss}
        />
      </m.div>
    </m.div>
  );
});
AnnouncementInternal.displayName = "AnnouncementInternal";

const MotionAnnouncement = m.create(AnnouncementInternal, {
  forwardMotionProps: true,
});

export function Announcement({
  className,
  announcement,
  children,
}: {
  className?: string;
  announcement?: string;
  children?: React.ReactNode;
}) {
  const isDismissed = useAnnouncementStore(
    (state) => state.announcement === announcement
  );

  const inserted = React.useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      announcement && (
        <script
          key="fern-announcement"
          type="text/javascript"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(${String((announcement: string) => {
              const dismissed = localStorage.getItem(
                "fern-announcement-dismissed"
              );

              if (
                dismissed &&
                JSON.parse(dismissed)?.state?.announcement === announcement
              ) {
                window.requestAnimationFrame(() => {
                  const announcement =
                    document.getElementById("fern-announcement");
                  if (announcement) {
                    announcement.remove();
                  }

                  const headerHeight =
                    document.getElementById("fern-header")?.clientHeight;
                  if (headerHeight != null) {
                    document.documentElement.style.setProperty(
                      "--header-height",
                      `${String(headerHeight)}px`
                    );
                  }
                });
              }
            })})(${JSON.stringify(announcement)})`,
          }}
        />
      )
    );
  });

  if (!announcement) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence mode="popLayout">
        {!isDismissed && (
          <MotionAnnouncement
            id="fern-announcement"
            suppressHydrationWarning
            className={cn("[&_.fern-mdx-link]:text-inherit", className)}
            exit={{ height: 0 }}
            dismiss={() => {
              useAnnouncementStore.setState({ announcement });
            }}
          >
            {children ?? announcement}
          </MotionAnnouncement>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
