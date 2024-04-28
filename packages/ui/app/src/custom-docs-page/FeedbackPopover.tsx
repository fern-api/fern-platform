import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, ThumbsDown, ThumbsUp } from "react-feather";
import { usePopper } from "react-popper";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernTextarea } from "../components/FernTextarea";

export const FeedbackPopover: React.FC = () => {
    const [isHelpful, setIsHelpful] = useState<boolean>();
    const [showMenu, setShowMenu] = useState(false);
    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
    const popperRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const { styles, attributes } = usePopper(referenceElement, popperRef.current, {
        placement: "top",
        modifiers: [
            {
                name: "offset",
                options: {
                    offset: [0, 8],
                },
            },
        ],
    });

    const selection = useMemo(() => window.getSelection(), []);

    const handleThumbsUp = useCallback(() => {
        const selectedText = selection?.toString().trim();
        setIsHelpful(true);
        capturePosthogEvent("feedback_voted", {
            satisfied: true,
            selectedText,
        });
    }, [selection]);

    const handleThumbsDown = useCallback(() => {
        const selectedText = selection?.toString().trim();
        setIsHelpful(false);
        capturePosthogEvent("feedback_voted", {
            satisfied: false,
            selectedText,
        });
    }, [selection]);

    const handleCreateHighlightLink = async () => {
        const selection = window.getSelection();
        if (selection?.toString().trim()) {
            const selectedText = selection.toString();
            const encodedText = encodeURIComponent(selectedText);

            // This is a cleanup incase there are already anchors in the URL
            const currentURL = window.location.href.split("#")[0];

            const highlightLink = `${currentURL}#:~:text=${encodedText}`;

            await navigator.clipboard.writeText(highlightLink);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
                setShowMenu(false);
            }, 1500);
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

    useEffect(() => {
        const handleDoubleClick = () => {
            const selection = window.getSelection();
            if (selection?.toString().trim()) {
                setTimeout(() => {
                    const range = selection.getRangeAt(0);
                    const selectionRect = range.getBoundingClientRect();

                    const fakeReference = document.createElement("div");
                    fakeReference.style.position = "absolute";
                    fakeReference.style.top = `${selectionRect.top}px`;
                    fakeReference.style.left = `${selectionRect.left}px`;
                    fakeReference.style.width = `${selectionRect.width}px`;
                    fakeReference.style.height = `${selectionRect.height}px`;
                    fakeReference.classList.add("bg-accent-highlight");
                    document.body.appendChild(fakeReference);

                    setReferenceElement(fakeReference);
                    setShowMenu(true);
                }, 0);
            }
        };

        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection?.toString().trim()) {
                const range = selection.getRangeAt(0);
                const selectionRect = range.getBoundingClientRect();

                const fakeReference = document.createElement("div");
                fakeReference.style.position = "absolute";
                fakeReference.style.top = `${selectionRect.top}px`;
                fakeReference.style.left = `${selectionRect.left}px`;
                fakeReference.style.width = `${selectionRect.width}px`;
                fakeReference.style.height = `${selectionRect.height}px`;
                fakeReference.classList.add("bg-accent-highlight");
                document.body.appendChild(fakeReference);

                setReferenceElement(fakeReference);
                setShowMenu(true);
            } else if (popperRef.current && popperRef.current.contains(document.activeElement)) {
                // Keep the popover open if the textarea is focused
                setShowMenu(true);
            } else {
                setShowMenu(false);
                setReferenceElement(null);
                // Clear feedback states when text selection is removed
                setIsHelpful(undefined);
                setCopied(false);
                setFeedbackSubmitted(false);
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
                    const selection = window.getSelection();
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
                setCopied(false);
                setFeedbackSubmitted(false);
            }
        };

        const handleTextareaBlur = () => {
            setFeedbackSubmitted(true);
            setTimeout(() => {
                setShowMenu(false);
                setReferenceElement(null);
                setIsHelpful(undefined);
                setCopied(false);
                setFeedbackSubmitted(false);
            }, 1500);
        };

        const handleTextareaFocus = () => {
            if (popperRef.current) {
                const textareaRect = popperRef.current.getBoundingClientRect();
                const fakeReference = document.createElement("div");
                fakeReference.style.position = "absolute";
                fakeReference.style.top = `${textareaRect.top}px`;
                fakeReference.style.left = `${textareaRect.left}px`;
                fakeReference.style.width = `${textareaRect.width}px`;
                fakeReference.style.height = `${textareaRect.height}px`;
                document.body.appendChild(fakeReference);

                setReferenceElement(fakeReference);
            }
        };

        document.addEventListener("dblclick", handleDoubleClick);
        document.addEventListener("selectionchange", handleSelectionChange);
        window.addEventListener("hashchange", handleHashChange);
        document.addEventListener("keydown", handleEscapeKey);

        const textarea = document.getElementById("more-feedback") as HTMLTextAreaElement;
        if (textarea) {
            textarea.addEventListener("blur", handleTextareaBlur);
            textarea.addEventListener("focus", handleTextareaFocus);
        }

        handleHashChange();

        return () => {
            document.removeEventListener("dblclick", handleDoubleClick);
            document.removeEventListener("selectionchange", handleSelectionChange);
            window.removeEventListener("hashchange", handleHashChange);
            document.removeEventListener("keydown", handleEscapeKey);

            if (textarea) {
                textarea.removeEventListener("blur", handleTextareaBlur);
                textarea.removeEventListener("focus", handleTextareaFocus);
            }
        };
    }, [findTextNode]);

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
            <motion.div
                ref={popperRef}
                style={styles.popper}
                {...attributes.popper}
                className="fixed z-50 rounded-lg border border-default bg-white/50 backdrop-blur-xl dark:bg-background/50 p-1 shadow-xl"
            >
                <FernButtonGroup>
                    <FernButton
                        icon={<ThumbsUp className={clsx("opacity-60", { "animate-thumb-rock": isHelpful })} />}
                        variant="minimal"
                        intent={isHelpful ? "success" : "none"}
                        active={isHelpful}
                        onClick={handleThumbsUp}
                    >
                        Helpful
                    </FernButton>
                    <FernButton
                        icon={
                            <ThumbsDown className={clsx("opacity-60", { "animate-thumb-rock": isHelpful === false })} />
                        }
                        variant="minimal"
                        intent={isHelpful === false ? "danger" : "none"}
                        active={isHelpful === false}
                        onClick={handleThumbsDown}
                    >
                        Not Helpful
                    </FernButton>
                    {isHelpful === undefined && (
                        <>
                            <div className="w-px h-8 mx-1 bg-border-default" />
                            <FernButton
                                icon={<Link className="opacity-60" />}
                                variant="minimal"
                                onClick={handleCreateHighlightLink}
                            >
                                {copied ? "Copied!" : "Copy highlight"}
                            </FernButton>
                        </>
                    )}
                </FernButtonGroup>
                <AnimatePresence>
                    {isHelpful !== undefined && !feedbackSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <label htmlFor="more-feedback" className="block mt-2">
                                {isHelpful ? "What did you like?" : "What went wrong?"}
                            </label>
                            <FernTextarea id="more-feedback" />
                        </motion.div>
                    )}
                    {feedbackSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-sm mt-2">Thank you for your feedback!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Transition>
    );
};
