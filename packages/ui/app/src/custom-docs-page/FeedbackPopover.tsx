import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, ThumbsDown, ThumbsUp } from "react-feather";
import { usePopper } from "react-popper";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { toast } from "../components/FernToast";
import { useHighlightLink } from "../hooks/useHighlightLink";
import { FeedbackForm } from "./FeedbackForm";
import { useSelection } from "../hooks/useSelection";

const MotionFernButton = motion(FernButton);
const MotionFernButtonGroup = motion(FernButtonGroup);

export const FeedbackPopover: React.FC = () => {
    const [isHelpful, setIsHelpful] = useState<boolean>();
    const [showMenu, setShowMenu] = useState(false);
    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
    const popperRef = useRef<HTMLDivElement>(null);
    const createAndCopyHighlightLink = useHighlightLink();
    const { selection } = useSelection();

    const { styles, attributes } = usePopper(referenceElement, popperRef.current, {
        placement: "auto",
        modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
    });

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

    const handleCreateHighlightLink = async () => {
        if (selection?.toString().trim()) {
            await createAndCopyHighlightLink();
            setShowMenu(false);
        }
    };

    const findTextNode = useCallback((node: Node, text: string): Node | null => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes(text)) {
            return node;
        }

        for (let i = 0; i < node.childNodes.length; i++) {
            const foundNode = findTextNode(node.childNodes[i], text);
            if (foundNode) {
                return foundNode;
            }
        }

        return null;
    }, []);

    const handleSubmitFeedback = useCallback(
        ({
            feedbackId,
            feedbackMessage,
        }: {
            feedbackId: string;
            feedbackMessage: string;
            email: string;
            showEmailInput: boolean | "indeterminate";
        }) => {
            capturePosthogEvent("feedback_submitted", {
                satisfied: true,
                message: feedbackMessage,
                feedback: feedbackId,
                selectedText: selection?.toString().trim(),
            });
            setShowMenu(false);
            toast.success("Thank you for submitting feedback!");
            setTimeout(() => {
                setReferenceElement(null);
                setIsHelpful(undefined);
                // removeFakeHighlight();
            }, 200);
        },
        [selection],
    );

    const handleMouseDown = (event: MouseEvent) => {
        if (popperRef.current && !popperRef.current.contains(event.target as Node)) {
            setShowMenu(false);
            setReferenceElement(null);
            setIsHelpful(undefined);
            // removeFakeHighlight();
        }
    };

    useEffect(() => {
        const removeFakeHighlight = () => {
            const fakeHighlight = document.querySelector("[data-fake-highlight]");
            if (fakeHighlight) {
                fakeHighlight.remove();
            }
        };

        const handleDoubleClick = () => {
            if (selection?.toString().trim()) {
                setTimeout(() => {
                    removeFakeHighlight();
                    const range = selection.getRangeAt(0);
                    const selectionRect = range.getBoundingClientRect();

                    const fakeReference = document.createElement("div");
                    fakeReference.style.position = "absolute";
                    fakeReference.style.top = `${selectionRect.top}px`;
                    fakeReference.style.left = `${selectionRect.left}px`;
                    fakeReference.style.width = `${selectionRect.width}px`;
                    fakeReference.style.height = `${selectionRect.height}px`;
                    fakeReference.setAttribute("data-fake-highlight", "");
                    document.body.appendChild(fakeReference);

                    setReferenceElement(fakeReference);
                    setShowMenu(true);
                }, 0);
            }
        };

        const handleSelectionChange = () => {
            if (selection?.toString().trim()) {
                if (!showMenu) {
                    removeFakeHighlight();
                }
                const range = selection.getRangeAt(0);
                const selectionRect = range.getBoundingClientRect();

                const fakeReference = document.createElement("div");
                fakeReference.style.position = "absolute";
                fakeReference.style.top = `${selectionRect.top}px`;
                fakeReference.style.left = `${selectionRect.left}px`;
                fakeReference.style.width = `${selectionRect.width}px`;
                fakeReference.style.height = `${selectionRect.height}px`;
                fakeReference.setAttribute("data-fake-highlight", "");
                document.body.appendChild(fakeReference);

                setReferenceElement(fakeReference);
                setShowMenu(true);
            } else if (popperRef.current && popperRef.current.contains(document.activeElement)) {
                // Keep the popover open if the input is focused
                setShowMenu(true);
            }
        };

        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith("#:~:text=")) {
                const encodedText = hash.slice("#:~:text=".length);
                const decodedText = decodeURIComponent(encodedText);

                const textNode = findTextNode(document.body, decodedText);
                if (textNode) {
                    const range = document.createRange();
                    range.selectNodeContents(textNode);
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                    textNode.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowMenu(false);
                setReferenceElement(null);
                setIsHelpful(undefined);
                removeFakeHighlight();
            }
        };

        const handleInputFocus = () => {
            if (popperRef.current && referenceElement) {
                if (!selection?.toString().trim()) {
                    const fakeHighlight = document.querySelector("[data-fake-highlight]");
                    if (fakeHighlight) {
                        fakeHighlight.classList.add("bg-accent-highlight");
                    }
                }
            }
        };

        document.addEventListener("dblclick", handleDoubleClick);
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("selectionchange", handleSelectionChange);
        document.addEventListener("keydown", handleEscapeKey);
        window.addEventListener("hashchange", handleHashChange);

        const input = document.getElementById("moreFeedback") as HTMLInputElement;
        if (input) {
            input.addEventListener("focus", handleInputFocus);
        }

        handleHashChange();

        return () => {
            document.removeEventListener("dblclick", handleDoubleClick);
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("selectionchange", handleSelectionChange);
            document.removeEventListener("keydown", handleEscapeKey);
            window.removeEventListener("hashchange", handleHashChange);

            if (input) {
                input.removeEventListener("focus", handleInputFocus);
            }
        };
    }, [findTextNode, referenceElement, selection, showMenu]);

    const voteButtons = useMemo(
        () => (
            <div
                className={clsx("p-0 w-fit", {
                    "p-1 space-x-1 rounded-lg bg-background backdrop-blur-xl": isHelpful !== undefined,
                })}
            >
                <MotionFernButton
                    layoutId="thumbs-up"
                    icon={<ThumbsUp className={clsx("opacity-60", { "animate-thumb-rock": isHelpful })} />}
                    variant="minimal"
                    intent={isHelpful ? "success" : "none"}
                    active={isHelpful}
                    onClick={handleThumbsUp}
                >
                    Helpful
                </MotionFernButton>
                <MotionFernButton
                    layoutId="thumbs-down"
                    icon={<ThumbsDown className={clsx("opacity-60", { "animate-thumb-rock": isHelpful === false })} />}
                    variant="minimal"
                    intent={isHelpful === false ? "danger" : "none"}
                    active={isHelpful === false}
                    onClick={handleThumbsDown}
                >
                    Not Helpful
                </MotionFernButton>
            </div>
        ),
        [handleThumbsDown, handleThumbsUp, isHelpful],
    );

    return (
        <Transition
            show={showMenu}
            as={React.Fragment}
            enter="transition-all origin-bottom-right"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="transition-all"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-8"
        >
            <motion.div ref={popperRef} style={styles.popper} {...attributes.popper} className="z-50">
                {isHelpful !== undefined && voteButtons}
                <motion.div
                    className={clsx(
                        "rounded-lg border border-default bg-white/50 backdrop-blur-xl dark:bg-background/50 p-1 shadow-xl min-w-72",
                        { "p-2": isHelpful !== undefined },
                    )}
                >
                    {isHelpful === undefined && (
                        <MotionFernButtonGroup className="flex items-center">
                            {voteButtons}
                            {isHelpful === undefined && (
                                <>
                                    <div className="w-px h-8 mx-1 bg-border-default" />
                                    <MotionFernButton
                                        icon={<Link className="opacity-60" />}
                                        variant="minimal"
                                        onClick={handleCreateHighlightLink}
                                    >
                                        Copy highlight
                                    </MotionFernButton>
                                </>
                            )}
                        </MotionFernButtonGroup>
                    )}
                    <AnimatePresence>
                        {isHelpful !== undefined && (
                            <FeedbackForm
                                layoutDensity="condensed"
                                onSubmit={handleSubmitFeedback}
                                isHelpful={isHelpful}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </Transition>
    );
};
