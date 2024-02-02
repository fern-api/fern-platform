import { FC, useRef, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton } from "../components/FernButton";
import { FernCollapse } from "../components/FernCollapse";

interface FeedbackProps {}

export const Feedback: FC<FeedbackProps> = () => {
    const [sent, setSent] = useState(false);
    const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const handleYes = () => {
        setFeedback("yes");
        setShowFeedbackInput(true);
        textareaRef.current?.focus();
        capturePosthogEvent("feedback_voted", {
            satisfied: true,
        });
    };
    const handleNo = () => {
        setFeedback("no");
        setShowFeedbackInput(true);
        textareaRef.current?.focus();
        capturePosthogEvent("feedback_voted", {
            satisfied: false,
        });
    };
    const handleSubmitFeedback = () => {
        capturePosthogEvent("feedback_submitted", {
            satisfied: feedback === "yes" ? true : false,
            message: textareaRef.current?.value,
        });
        setSent(true);
    };
    return (
        <div className="border-border-default-light dark:border-border-default-dark group my-12 w-fit rounded-lg border">
            {!sent ? (
                <div className="flex items-center gap-4 px-4 py-2">
                    <span className="t-muted text-sm">Did this page help you?</span>
                    <div className="flex items-center">
                        <FernButton
                            icon="regular thumbs-up"
                            minimal
                            intent={feedback === "yes" ? "success" : "none"}
                            onClick={handleYes}
                            active={feedback === "yes"}
                        >
                            Yes
                        </FernButton>
                        <FernButton
                            icon="regular thumbs-down"
                            minimal={true}
                            intent={feedback === "no" ? "danger" : "none"}
                            onClick={handleNo}
                            active={feedback === "no"}
                        >
                            No
                        </FernButton>
                    </div>
                </div>
            ) : (
                <div className="px-4 py-2">
                    <div className="t-muted text-sm">Thank you for your feedback!</div>
                </div>
            )}
            {!sent && (
                <FernCollapse isOpen={showFeedbackInput}>
                    <div className="px-4 pb-4">
                        <textarea
                            ref={textareaRef}
                            autoFocus={true}
                            className="border-border-default-light dark:border-border-default-dark focus-visible:ring-tag-primary focus-visible:dark:ring-tag-primary-dark focus-visible:border-accent-primary focus-visible:dark:border-accent-primary-dark w-full rounded-md border bg-white p-2 text-sm focus:outline-none focus-visible:ring-2 dark:bg-white/10"
                        />
                        <FernButton full={true} intent="primary" className="rounded-md" onClick={handleSubmitFeedback}>
                            Send feedback
                        </FernButton>
                    </div>
                </FernCollapse>
            )}
        </div>
    );
};
