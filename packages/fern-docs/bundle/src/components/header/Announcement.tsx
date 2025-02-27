"use client";

import React from "react";

import { X } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";
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

  const [isClientSide, setIsClientSide] = React.useState(false);

  React.useEffect(() => {
    setIsClientSide(true);
  }, []);

  if (!announcement) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation} strict>
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
    </LazyMotion>
  );
}
