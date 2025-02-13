"use client";

import { useServerInsertedHTML } from "next/navigation";
import React from "react";

import { Xmark } from "iconoir-react";
import { AnimatePresence, motion } from "motion/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    { name: "fern-announcement-dismissed", version: 1 }
  )
);

const AnnouncementInternal = React.forwardRef<
  React.ComponentRef<typeof motion.div>,
  {
    dismiss: () => void;
    children?: React.ReactNode;
  } & Omit<React.ComponentPropsWithoutRef<typeof motion.div>, "children">
>(({ dismiss, className, children, ...props }, forwardedRef) => {
  return (
    <motion.div
      ref={forwardedRef}
      {...props}
      className={cn("overflow-hidden", className)}
    >
      <motion.div
        className="bg-accent text-accent-contrast flex min-h-8 items-center"
        exit={{ y: "-100%" }}
      >
        <div className="max-w-page-width mx-auto flex-1 px-4 text-center md:px-6 lg:px-8">
          {children}
        </div>
        <FernButton
          variant="minimal"
          className="absolute right-0"
          icon={<Xmark className="!text-accent-contrast" />}
          onClick={dismiss}
        />
      </motion.div>
    </motion.div>
  );
});
AnnouncementInternal.displayName = "AnnouncementInternal";

const MotionAnnouncement = motion.create(AnnouncementInternal, {
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
                    document.querySelector(".fern-announcement");
                  if (announcement) {
                    announcement.remove();
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
    <AnimatePresence mode="popLayout">
      {!isDismissed && (
        <MotionAnnouncement
          suppressHydrationWarning
          className={cn("fern-announcement", className)}
          exit={{ height: 0 }}
          dismiss={() => {
            useAnnouncementStore.setState({ announcement });
          }}
        >
          {children ?? announcement}
        </MotionAnnouncement>
      )}
    </AnimatePresence>
  );
}
