"use client";

import { forwardRef, useCallback, useMemo, useState } from "react";

import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import * as Selection from "selection-popover";

import { cn } from "@fern-docs/components";
import { FernButton, FernButtonGroup } from "@fern-docs/components";

import { track } from "../analytics";
import { useSelection } from "../hooks/useSelection";
import { FeedbackForm } from "./FeedbackForm";

const MotionFernButton = m.create(FernButton);
const MotionFernButtonGroup = m.create(FernButtonGroup);
const MotionSelectionContent = m.create(Selection.Content);

type SelectionTextToolbarElement = React.ComponentRef<typeof Selection.Trigger>;
type SelectionTextToolbarProps = {
  children: React.ReactNode;
};

// const CopyLinkButton = () => {
//     const [buttonState, setButtonState] = useState<"idle" | "copied">("idle");
//     const { selection } = useSelection();
//     const createAndCopyHighlightLink = useHighlightLink();

//     const handleCreateHighlightLink = useCallback(async () => {
//         setButtonState("copied");
//         if (selection?.toString().trim()) {
//             await createAndCopyHighlightLink();
//         }
//         setTimeout(() => {
//             setButtonState("idle");
//         }, 2000);
//         return;
//     }, [createAndCopyHighlightLink, selection]);

//     const variants = {
//         hidden: { opacity: 0, scale: 0.5 },
//         visible: { opacity: 0.75, scale: 1 },
//     };

//     const buttonCopy = {
//         idle: "Copy highlight",
//         copied: "Link copied!",
//     };

//     return (
//         <MotionFernButton
//             transition={{ duration: 0.1 }}
//             layoutId="copy-highlight"
//             icon={
//                 <AnimatePresence mode="wait" initial={false}>
//                     {buttonState === "copied" ? (
//                         <motion.span
//                             key="checkmark"
//                             variants={variants}
//                             initial="hidden"
//                             animate="visible"
//                             exit="hidden"
//                         >
//                             <Check className="h-4 w-4" />
//                         </motion.span>
//                     ) : (
//                         <motion.span key="copy" variants={variants} initial="hidden" animate="visible" exit="hidden">
//                             <Link className="h-4 w-4" />
//                         </motion.span>
//                     )}
//                 </AnimatePresence>
//             }
//             variant="minimal"
//             onClick={handleCreateHighlightLink}
//         >
//             <motion.span layoutId="button-text">{buttonCopy[buttonState]}</motion.span>
//         </MotionFernButton>
//     );
// };

const FeedbackPopover = forwardRef<
  SelectionTextToolbarElement,
  SelectionTextToolbarProps
>(({ children }, forwardedRef) => {
  const [isHelpful, setIsHelpful] = useState<"yes" | "no" | undefined>();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] =
    useState<boolean>(false);
  const { selection } = useSelection();

  const handleThumbsUp = useCallback(() => {
    setIsHelpful("yes");
    track("feedback_voted", {
      satisfied: true,
      selectedText: selection?.toString().trim(),
    });
  }, [selection]);

  const handleThumbsDown = useCallback(() => {
    setIsHelpful("no");
    track("feedback_voted", {
      satisfied: false,
      selectedText: selection?.toString().trim(),
    });
  }, [selection]);

  const handleSubmitFeedback = useCallback(
    ({
      feedbackId,
    }: {
      feedbackId: string;
      feedbackMessage: string;
      email: string;
      showEmailInput: boolean | "indeterminate";
    }) => {
      track("feedback_submitted", {
        satisfied: isHelpful,
        feedback: feedbackId,
        selectedText: selection?.toString().trim(),
      });
      setIsFeedbackSubmitted(true);
      setTimeout(() => {
        setIsFeedbackSubmitted(false);
        setIsHelpful(undefined);
      }, 3000);
    },
    [isHelpful, selection]
  );

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setIsHelpful(undefined);
    }
  }, []);

  const voteButtons = useMemo(
    () => (
      <>
        <MotionFernButton
          layoutId="thumbs-up"
          icon={
            <ThumbsUp
              className={cn("opacity-60", {
                "animate-thumb-rock": isHelpful === "yes",
              })}
            />
          }
          variant="minimal"
          intent={isHelpful === "yes" ? "success" : "none"}
          active={isHelpful === "yes"}
          onClick={handleThumbsUp}
          className={cn({ "w-full": isHelpful !== undefined })}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          Helpful
        </MotionFernButton>
        <MotionFernButton
          layoutId="thumbs-down"
          icon={
            <ThumbsDown
              className={cn("opacity-60", {
                "animate-thumb-rock": isHelpful === "no",
              })}
            />
          }
          variant="minimal"
          intent={isHelpful === "no" ? "danger" : "none"}
          active={isHelpful === "no"}
          onClick={handleThumbsDown}
          className={cn({ "w-full": isHelpful !== undefined })}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          Not Helpful
        </MotionFernButton>
      </>
    ),
    [handleThumbsDown, handleThumbsUp, isHelpful]
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <Selection.Root whileSelect onOpenChange={handleOpenChange}>
        <Selection.Trigger ref={forwardedRef}>{children}</Selection.Trigger>
        <Selection.Portal>
          <MotionSelectionContent
            layout
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            sideOffset={8}
            className={cn(
              "border-border-default dark:bg-background/50 rounded-2 z-50 border bg-white/50 p-1 shadow-xl backdrop-blur-xl",
              {
                "min-w-80 space-y-2 p-2": isHelpful !== undefined,
              }
            )}
          >
            <MotionFernButtonGroup layout className="flex items-center gap-1">
              {!isFeedbackSubmitted && voteButtons}
              {/* TODO: make the createCopyHighlightLink hook more robust https://github.com/GoogleChromeLabs/text-fragments-polyfill/blob/main/src/text-fragments.js */}
              {/* {isHelpful === undefined && (
                                <>
                                    <motion.div layoutId="divider" className="w-px h-8 mx-1 bg-border-default" />
                                    <CopyLinkButton />
                                </>
                            )} */}
            </MotionFernButtonGroup>

            {isHelpful !== undefined &&
              (isFeedbackSubmitted ? (
                <m.div
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  key={isFeedbackSubmitted === undefined ? "y" : "n"}
                  className="space-y-2 py-2"
                >
                  <m.div
                    layoutId="icon-container"
                    className="bg-(color:--accent-a3) text-(color:--accent-a11) rounded-3/2 mx-auto flex size-8 items-center justify-center"
                  >
                    <Check />
                  </m.div>
                  <m.p
                    layoutId="success-title"
                    className="text-md text-center font-semibold"
                  >
                    Feedback received!
                  </m.p>
                  <m.p
                    layoutId="success-description"
                    className="text-(color:--grayscale-a11) text-center text-sm"
                  >
                    Thank you for improving the docs.
                  </m.p>
                </m.div>
              ) : (
                <m.div
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  key={isHelpful === undefined ? "y" : "n"}
                >
                  <FeedbackForm
                    layoutDensity="condensed"
                    onSubmit={handleSubmitFeedback}
                    isHelpful={isHelpful}
                  />
                </m.div>
              ))}
          </MotionSelectionContent>
        </Selection.Portal>
      </Selection.Root>
    </LazyMotion>
  );
});

FeedbackPopover.displayName = "FeedbackPopover";

export default FeedbackPopover;
