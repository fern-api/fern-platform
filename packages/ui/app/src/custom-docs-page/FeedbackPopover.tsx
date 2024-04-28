import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Link, ThumbsDown, ThumbsUp } from "react-feather";
import { usePopper } from "react-popper";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FernInput } from "../components/FernInput";

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

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        capturePosthogEvent("feedback_submitted", {
            satisfied: true,
            message: event,
            // selectedText,
        });
        setFeedbackSubmitted(true);
        setTimeout(() => {
            setShowMenu(false);
            setReferenceElement(null);
            setIsHelpful(undefined);
            setCopied(false);
            setFeedbackSubmitted(false);
            // removeFakeHighlight();
        }, 2000);
    }, []);

    useEffect(() => {
        const removeFakeHighlight = () => {
            const fakeHighlight = document.querySelector("[data-fake-highlight]");
            if (fakeHighlight) {
                fakeHighlight.remove();
            }
        };

        const handleDoubleClick = () => {
            const selection = window.getSelection();
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
            const selection = window.getSelection();
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
            } else {
                setShowMenu(false);
                setReferenceElement(null);
                // Clear feedback states when text selection is removed
                setIsHelpful(undefined);
                setCopied(false);
                setFeedbackSubmitted(false);
                removeFakeHighlight();
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
                removeFakeHighlight();
            }
        };

        const handleInputFocus = () => {
            if (popperRef.current && referenceElement) {
                const selection = window.getSelection();
                if (!selection?.toString().trim()) {
                    const fakeHighlight = document.querySelector("[data-fake-highlight]");
                    if (fakeHighlight) {
                        fakeHighlight.classList.add("bg-accent-highlight");
                    }
                }
            }
        };

        document.addEventListener("dblclick", handleDoubleClick);
        document.addEventListener("selectionchange", handleSelectionChange);
        window.addEventListener("hashchange", handleHashChange);
        document.addEventListener("keydown", handleEscapeKey);

        const input = document.getElementById("moreFeedback") as HTMLInputElement;
        if (input) {
            input.addEventListener("focus", handleInputFocus);
        }

        handleHashChange();

        return () => {
            document.removeEventListener("dblclick", handleDoubleClick);
            document.removeEventListener("selectionchange", handleSelectionChange);
            window.removeEventListener("hashchange", handleHashChange);
            document.removeEventListener("keydown", handleEscapeKey);

            if (input) {
                input.removeEventListener("focus", handleInputFocus);
            }
        };
    }, [findTextNode, referenceElement, showMenu]);

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
                className={clsx(
                    "fixed z-50 rounded-lg border border-default bg-white/50 backdrop-blur-xl dark:bg-background/50 p-1 shadow-xl",
                    { "p-2": isHelpful !== undefined },
                )}
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
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-2"
                        >
                            <label htmlFor="moreFeedback" className="mt-2 t-muted text-sm font-medium">
                                {isHelpful ? "What did you like?" : "What could improve?"}
                            </label>
                            <FernInput id="moreFeedback" name="moreFeedback" className="min-w-60" />
                            <FernButton type="submit" intent="primary" className="self-end">
                                Submit
                            </FernButton>
                        </motion.form>
                    )}
                    {feedbackSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-1.5"
                        >
                            <Heart className="text-accent-primary-aaa animate-pulse" />
                            <p className="text-sm mt-2">Thank you for your feedback!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Transition>
    );
};
