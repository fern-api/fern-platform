"use client";

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
      suppressHydrationWarning
      ref={forwardedRef}
      {...props}
      className={cn("overflow-hidden", className)}
    >
      <motion.div
        className="bg-(--accent) text-(color:--accent-contrast) flex min-h-8 items-center px-4 md:px-6 lg:px-8"
        exit={{ y: "-100%" }}
      >
        <div className="max-w-page-width mx-auto flex-1 text-center">
          {children}
        </div>
        <FernButton
          variant="minimal"
          className="absolute right-0"
          icon={<Xmark className="!text-(color:--accent-contrast)" />}
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

  const [isClientSide, setIsClientSide] = React.useState(false);

  React.useEffect(() => {
    setIsClientSide(true);
  }, []);

  if (!announcement) {
    return null;
  }

  return (
    <AnimatePresence mode="popLayout">
      {!isDismissed && isClientSide && (
        <MotionAnnouncement
          suppressHydrationWarning
          className={cn(
            "fern-announcement [&_.fern-mdx-link]:text-inherit",
            className
          )}
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
