import { useKeyboardPress } from "@fern-ui/react-commons";
import { Portal, Transition } from "@headlessui/react";
import classNames from "classnames";
import { useRouter } from "next/router";
import { FC, useEffect, useRef, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton } from "../components/FernButton";
import { FernRadio } from "../components/FernRadio";
import { FernTextarea } from "../components/FernTextarea";
import { useViewportContext } from "../viewport-context/useViewportContext";

interface FeedbackProps {
    className?: string;
}

export const Feedback: FC<FeedbackProps> = ({ className }) => {
    const router = useRouter();
    const [sent, setSent] = useState(false);
    const [feedback, setFeedback] = useState<"yes" | "no">();
    const [feedbackDetail, setFeedbackDetail] = useState<string>();
    const [feedbackMessage, setFeedbackMessage] = useState<string>();
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const fieldsetRef = useRef<HTMLFieldSetElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const { viewportSize } = useViewportContext();

    useEffect(() => {
        if (!showFeedbackInput) {
            return undefined;
        }
        let raf: number;
        function step() {
            const modal = modalRef.current;
            const feedback = ref.current;
            if (modal == null || feedback == null) {
                raf = window.requestAnimationFrame(step);
                return;
            }
            const feedbackRect = feedback.getBoundingClientRect();

            // stick to the top right corner of the feedback container
            const bottom = viewportSize.height - feedbackRect.top + 8;
            const right = viewportSize.width - feedbackRect.right;
            modal.style.bottom = `${bottom}px`;
            modal.style.right = `${right}px`;

            raf = window.requestAnimationFrame(step);
        }

        raf = window.requestAnimationFrame(step);
        return () => {
            window.cancelAnimationFrame(raf);
        };
    }, [showFeedbackInput, viewportSize.height, viewportSize.width]);

    useEffect(() => {
        const resetForm = () => {
            setSent(false);
            setFeedback(undefined);
            setFeedbackDetail(undefined);
            setShowFeedbackInput(false);
        };
        router.events.on("routeChangeComplete", resetForm);
        return () => {
            router.events.off("routeChangeComplete", resetForm);
        };
    }, [router.events]);

    const handleYes = () => {
        setFeedback("yes");
        setFeedbackDetail(undefined);
        setShowFeedbackInput(true);
        textareaRef.current?.focus();
        capturePosthogEvent("feedback_voted", {
            satisfied: true,
        });
    };
    const handleNo = () => {
        setFeedback("no");
        setFeedbackDetail(undefined);
        setShowFeedbackInput(true);
        textareaRef.current?.focus();
        capturePosthogEvent("feedback_voted", {
            satisfied: false,
        });
    };

    const handleSubmitFeedback = () => {
        capturePosthogEvent("feedback_submitted", {
            satisfied: feedback === "yes" ? true : false,
            feedback: feedbackDetail,
            message: feedbackMessage,
        });
        setSent(true);
    };

    useKeyboardPress({
        key: "Escape",
        onPress: () => {
            if (textareaRef.current === document.activeElement) {
                textareaRef.current?.blur();
                fieldsetRef.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
            } else if (showFeedbackInput) {
                setShowFeedbackInput(false);
            }
        },
    });

    const legend = feedback === "yes" ? "What did you like?" : feedback === "no" ? "What went wrong?" : "Feedback";
    const feedbackOptions = feedback === "yes" ? POSITIVE_FEEDBACK : feedback === "no" ? NEGATIVE_FEEDBACK : [];
    return (
        <div className={classNames("mt-12", className)} ref={ref}>
            {!sent ? (
                <div className="flex items-center justify-between gap-1">
                    <span className="t-muted text-xs">Was this page helpful?</span>
                    <span className="-mr-1 inline-flex items-center">
                        <FernButton
                            icon="regular thumbs-up"
                            minimal
                            intent={feedback === "yes" ? "success" : "none"}
                            onClick={handleYes}
                            active={feedback === "yes"}
                            small
                        >
                            Yes
                        </FernButton>
                        <FernButton
                            icon="regular thumbs-down"
                            minimal={true}
                            intent={feedback === "no" ? "danger" : "none"}
                            onClick={handleNo}
                            active={feedback === "no"}
                            small
                        >
                            No
                        </FernButton>
                    </span>
                </div>
            ) : (
                <div className="flex h-6 items-center">
                    <span className="t-muted text-xs">Thank you for your feedback!</span>
                </div>
            )}
            {!sent && (
                <Portal>
                    <Transition
                        ref={modalRef}
                        show={showFeedbackInput}
                        className="border-border-default-light dark:border-border-default-dark fixed z-50 w-96 rounded-lg border bg-white/50 p-4 shadow-xl backdrop-blur-xl dark:bg-white/10"
                        enter="transition-all origin-bottom-right"
                        enterFrom="opacity-0 scale-90"
                        enterTo="opacity-100 scale-100"
                        leave="transition-all"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-8"
                    >
                        <fieldset className="p-0" ref={fieldsetRef}>
                            <legend className="text-lg font-semibold">{legend}</legend>

                            <ul className="flex flex-col gap-0">
                                {feedbackOptions.map((item, idx) => (
                                    <li key={item.feedbackId}>
                                        <FernRadio
                                            className="w-full"
                                            name="feedback"
                                            onChecked={(checked) => {
                                                if (checked) {
                                                    setFeedbackDetail(item.feedbackId);
                                                }
                                            }}
                                            tabIndex={idx}
                                        >
                                            <div className="text-sm">{item.title}</div>
                                            <p className="t-muted mb-0 text-xs">{item.description}</p>
                                            {feedbackDetail === item.feedbackId && (
                                                <FernTextarea
                                                    ref={textareaRef}
                                                    autoFocus={true}
                                                    className="mt-2 w-full"
                                                    placeholder="(Optional) Tell us more about your experience"
                                                    onValueChange={setFeedbackMessage}
                                                    value={feedbackMessage}
                                                />
                                            )}
                                        </FernRadio>
                                    </li>
                                ))}
                                <li>
                                    {feedbackOptions.length > 0 ? (
                                        <FernRadio
                                            name="feedback"
                                            className="w-full"
                                            onChecked={(checked) => {
                                                if (checked) {
                                                    setFeedbackDetail("other");
                                                }
                                            }}
                                        >
                                            <div className="text-sm">Another reason</div>
                                            {feedbackDetail === "other" && (
                                                <FernTextarea
                                                    ref={textareaRef}
                                                    autoFocus={true}
                                                    className="mt-2 w-full"
                                                    placeholder="Tell us about your experience"
                                                    onValueChange={setFeedbackMessage}
                                                    value={feedbackMessage}
                                                />
                                            )}
                                        </FernRadio>
                                    ) : (
                                        <FernTextarea
                                            ref={textareaRef}
                                            className="mt-2 w-full"
                                            placeholder="Help us improve the docs"
                                            onValueChange={setFeedbackMessage}
                                            value={feedbackMessage}
                                        />
                                    )}
                                </li>
                            </ul>

                            <FernButton
                                full={true}
                                intent="primary"
                                className="mt-4 rounded-md"
                                onClick={handleSubmitFeedback}
                                disabled={feedbackDetail == null}
                            >
                                Send feedback
                            </FernButton>
                        </fieldset>
                    </Transition>
                </Portal>
            )}
        </div>
    );
};

interface FeedbackItem {
    feedbackId: string;
    title: string;
    description: string;
    satisfied: boolean;
}

const POSITIVE_FEEDBACK: FeedbackItem[] = [
    {
        feedbackId: "accurate",
        title: "Accurate",
        description: "Accurately describes the product or feature.",
        satisfied: true,
    },
    {
        feedbackId: "solved-my-issue",
        title: "Solved my issue",
        description: "Helped me resolve an issue.",
        satisfied: true,
    },
    {
        feedbackId: "easy-to-understand",
        title: "Easy to understand",
        description: "Easy to follow and comprehend.",
        satisfied: true,
    },
    {
        feedbackId: "product-adoption",
        title: "Helped me decide to use the product",
        description: "Convinced me to adopt the product or feature.",
        satisfied: true,
    },
];

const NEGATIVE_FEEDBACK: FeedbackItem[] = [
    {
        feedbackId: "inaccurate",
        title: "Inaccurate",
        description: "Doesn't accurately describe the product or feature.",
        satisfied: false,
    },
    {
        feedbackId: "hard-to-follow",
        title: "Couldn't find what I was looking for",
        description: "Missing important information.",
        satisfied: true,
    },
    {
        feedbackId: "hard-to-understand",
        title: "Hard to understand",
        description: "Too complicated or unclear.",
        satisfied: true,
    },
    {
        feedbackId: "code-sample-errors",
        title: "Code sample errors",
        description: "One or more code samples are incorrect.",
        satisfied: true,
    },
];
