import { FernButton } from "@fern-docs/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Xmark } from "iconoir-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ReactElement, forwardRef, useImperativeHandle, useRef } from "react";
import {
  ANNOUNCEMENT_CONFIG_ATOM,
  ANNOUNCEMENT_DISMISSED_ATOM,
  ANNOUNCEMENT_HEIGHT_ATOM,
  ANNOUNCEMENT_IS_DISMISSING_ATOM,
} from "../atoms";
import { MdxContent } from "../mdx/MdxContent";

interface AnnouncementInternalProps {
  className?: string;
  dismiss: () => void;
}

const AnnouncementInternal = forwardRef<
  HTMLDivElement,
  AnnouncementInternalProps
>(({ dismiss, className, ...props }, forwardedRef) => {
  const announcement = useAtomValue(ANNOUNCEMENT_CONFIG_ATOM);
  const setHeight = useSetAtom(ANNOUNCEMENT_HEIGHT_ATOM);
  const ref = useRef<HTMLDivElement>(null);

  useResizeObserver(ref, ([entry]) => {
    if (entry != null) {
      setHeight(entry.contentRect.height);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useImperativeHandle(forwardedRef, () => ref.current!);

  return (
    <motion.div
      ref={ref}
      {...props}
      className={clsx("fern-announcement", className)}
    >
      <motion.div
        className="bg-accent text-accent-contrast flex min-h-8 items-center"
        exit={{ y: "-100%" }}
      >
        <div className="max-w-page-width mx-auto flex-1 px-4 text-center md:px-6 lg:px-8">
          {announcement != null && <MdxContent mdx={announcement.mdx} />}
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

const MotionAnnouncement = motion(AnnouncementInternal, {
  forwardMotionProps: true,
});

export function Announcement({
  className,
}: {
  className?: string;
}): ReactElement<any> | null {
  const announcement = useAtomValue(ANNOUNCEMENT_CONFIG_ATOM);
  const [isDismissed, setIsDismissed] = useAtom(ANNOUNCEMENT_DISMISSED_ATOM);
  const setIsDismissing = useSetAtom(ANNOUNCEMENT_IS_DISMISSING_ATOM);

  if (announcement == null) {
    return null;
  }

  return (
    <AnimatePresence
      mode="popLayout"
      onExitComplete={() => setIsDismissing(false)}
    >
      {!isDismissed && (
        <MotionAnnouncement
          className={className}
          exit={{ height: 0 }}
          dismiss={() => {
            setIsDismissing(true);
            setIsDismissed(true);
          }}
        />
      )}
    </AnimatePresence>
  );
}
