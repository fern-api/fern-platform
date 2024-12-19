import { FernButton, FernButtonGroup } from "@fern-docs/components";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Check, ThumbsDown, ThumbsUp } from "iconoir-react";
import { forwardRef, useCallback, useMemo, useState } from "react";
import * as Selection from "selection-popover";
import { capturePosthogEvent } from "../analytics/posthog";
import { useSelection } from "../hooks/useSelection";
import { FeedbackForm } from "./FeedbackForm";

const MotionFernButton = motion(FernButton);
const MotionFernButtonGroup = motion(FernButtonGroup);
const MotionSelectionContent = motion(Selection.Content);

type SelectionTextToolbarElement = React.ElementRef<typeof Selection.Trigger>;
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

export const FeedbackPopover = forwardRef<
    SelectionTextToolbarElement,
    SelectionTextToolbarProps
>(({ children }, forwardedRef) => {
    const [isHelpful, setIsHelpful] = useState<boolean>();
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] =
        useState<boolean>(false);
    const { selection } = useSelection();

    const handleThumbsUp = useCallback(() => {
        setIsHelpful(true);
        capturePosthogEvent("feedback_voted", {
            satisfied: true,
            selectedText: selection?.toString().trim(),
        });
    }, [selection]);

    const handleThumbsDown = useCallback(() => {
        setIsHelpful(false);
        capturePosthogEvent("feedback_voted", {
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
            capturePosthogEvent("feedback_submitted", {
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
                            className={clsx("opacity-60", {
                                "animate-thumb-rock": isHelpful,
                            })}
                        />
                    }
                    variant="minimal"
                    intent={isHelpful ? "success" : "none"}
                    active={isHelpful}
                    onClick={handleThumbsUp}
                    className={clsx({ "w-full": isHelpful !== undefined })}
                    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                >
                    Helpful
                </MotionFernButton>
                <MotionFernButton
                    layoutId="thumbs-down"
                    icon={
                        <ThumbsDown
                            className={clsx("opacity-60", {
                                "animate-thumb-rock": isHelpful === false,
                            })}
                        />
                    }
                    variant="minimal"
                    intent={isHelpful === false ? "danger" : "none"}
                    active={isHelpful === false}
                    onClick={handleThumbsDown}
                    className={clsx({ "w-full": isHelpful !== undefined })}
                    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                >
                    Not Helpful
                </MotionFernButton>
            </>
        ),
        [handleThumbsDown, handleThumbsUp, isHelpful]
    );

    return (
        <Selection.Root whileSelect onOpenChange={handleOpenChange}>
            <Selection.Trigger ref={forwardedRef}>{children}</Selection.Trigger>
            <Selection.Portal>
                <MotionSelectionContent
                    layout
                    transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                    sideOffset={8}
                    className={clsx(
                        "z-50 rounded-lg border border-default bg-white/50 backdrop-blur-xl dark:bg-background/50 p-1 shadow-xl",
                        {
                            "p-2 space-y-2 min-w-80": isHelpful !== undefined,
                        }
                    )}
                >
                    <MotionFernButtonGroup
                        layout
                        className="flex items-center gap-1"
                    >
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
                            <motion.div
                                transition={{
                                    type: "spring",
                                    duration: 0.3,
                                    bounce: 0,
                                }}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                key={
                                    isFeedbackSubmitted === undefined
                                        ? "y"
                                        : "n"
                                }
                                className="space-y-2 py-2"
                            >
                                <motion.div
                                    layoutId="icon-container"
                                    className="bg-tag-primary t-accent size-8 mx-auto rounded-md flex items-center justify-center"
                                >
                                    <Check />
                                </motion.div>
                                <motion.p
                                    layoutId="success-title"
                                    className="text-md font-semibold text-center"
                                >
                                    Feedback received!
                                </motion.p>
                                <motion.p
                                    layoutId="success-description"
                                    className="t-muted text-sm text-center"
                                >
                                    Thank you for improving the docs.
                                </motion.p>
                            </motion.div>
                        ) : (
                            <motion.div
                                transition={{
                                    type: "spring",
                                    duration: 0.3,
                                    bounce: 0,
                                }}
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
                            </motion.div>
                        ))}
                </MotionSelectionContent>
            </Selection.Portal>
        </Selection.Root>
    );
});

FeedbackPopover.displayName = "FeedbackPopover";
