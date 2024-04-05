import { useKeyboardPress } from "@fern-ui/react-commons";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "react-feather";
import { capturePosthogEvent, registerPosthogProperties } from "../analytics/posthog";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackFormDialog } from "./FeedbackFormDialog";

export interface FeedbackProps {
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
        ({
            feedbackId,
            feedbackMessage,
            email,
            showEmailInput,
        }: {
            feedbackId: string;
            feedbackMessage: string;
            email: string;
            showEmailInput: boolean | "indeterminate";
        }) => {
            registerPosthogProperties({ email });
            capturePosthogEvent("feedback_submitted", {
                satisfied: feedback === "yes" ? true : false,
                feedback: feedbackId,
                message: feedbackMessage,
                email,
                allowFollowUpViaEmail: showEmailInput === true,
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

    const handleClose = useCallback(() => {
        setShowFeedbackInput(false);
    }, []);

    return (
        <div className={className} ref={ref}>
            {!sent ? (
                <div className="flex items-center justify-start gap-4">
                    <span className="t-muted text-sm">Was this page helpful?</span>
                    <FernButtonGroup>
                        <FernButton
                            icon={<ThumbsUp className="opacity-60" />}
                            variant="outlined"
                            intent={feedback === "yes" ? "success" : "none"}
                            onClick={handleYes}
                            active={feedback === "yes"}
                        >
                            Yes
                        </FernButton>
                        <FernButton
                            icon={<ThumbsDown className="opacity-60" />}
                            variant="outlined"
                            intent={feedback === "no" ? "danger" : "none"}
                            onClick={handleNo}
                            active={feedback === "no"}
                        >
                            No
                        </FernButton>
                    </FernButtonGroup>
                </div>
            ) : (
                <div className="flex h-6 items-center">
                    <span className="t-muted text-xs">Thank you for your feedback!</span>
                </div>
            )}
            {!sent && (
                <FeedbackFormDialog show={showFeedbackInput} targetRef={ref} onClose={handleClose}>
                    <FeedbackForm feedback={feedback} onSubmit={handleSubmitFeedback} />
                </FeedbackFormDialog>
            )}
        </div>
    );
};
