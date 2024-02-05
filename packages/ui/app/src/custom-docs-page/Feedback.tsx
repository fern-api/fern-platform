import { useKeyboardPress } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { capturePosthogEvent } from "../analytics/posthog";
import { FernButton } from "../components/FernButton";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackFormDialog } from "./FeedbackFormDialog";

interface FeedbackProps {
    className?: string;
}

export const Feedback: FC<FeedbackProps> = ({ className }) => {
    const router = useRouter();
    const [sent, setSent] = useState(false);
    const [feedback, setFeedback] = useState<"yes" | "no">();
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const resetForm = () => {
            setSent(false);
            setFeedback(undefined);
            setShowFeedbackInput(false);
        };
        router.events.on("routeChangeComplete", resetForm);
        return () => {
            router.events.off("routeChangeComplete", resetForm);
        };
    }, [router.events]);

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

    const handleSubmitFeedback = useCallback(
        (feedbackId: string, message: string) => {
            capturePosthogEvent("feedback_submitted", {
                satisfied: feedback === "yes" ? true : false,
                feedback: feedbackId,
                message,
            });
            setSent(true);
        },
        [feedback],
    );

    useKeyboardPress({
        key: "Escape",
        onPress: useCallback(() => {
            if (textareaRef.current !== document.activeElement && showFeedbackInput) {
                setShowFeedbackInput(false);
            }
        }, [showFeedbackInput]),
    });

    return (
        <div className={classNames("mt-12", className)} ref={ref}>
            {!sent ? (
                <div className="flex items-center justify-between gap-1">
                    <span className="t-muted text-xs">Was this page helpful?</span>
                    <span className="inline-flex items-center">
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
                <FeedbackFormDialog show={showFeedbackInput} targetRef={ref}>
                    <FeedbackForm feedback={feedback} onSubmit={handleSubmitFeedback} />
                </FeedbackFormDialog>
            )}
        </div>
    );
};
