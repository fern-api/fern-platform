import { useKeyboardPress } from "@fern-ui/react-commons";
import cn from "clsx";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "react-feather";
import { capturePosthogEvent, registerPosthogProperties } from "../analytics/posthog";
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
        <div className={cn("mt-12", className)} ref={ref}>
            {!sent ? (
                <div className="flex items-center justify-start gap-2">
                    <span className="t-muted text-xs">Was this page helpful?</span>
                    <span className="inline-flex items-center">
                        <FernButton
                            icon={<ThumbsUp />}
                            variant="minimal"
                            intent={feedback === "yes" ? "success" : "none"}
                            onClick={handleYes}
                            active={feedback === "yes"}
                            size="small"
                        >
                            Yes
                        </FernButton>
                        <FernButton
                            icon={<ThumbsDown />}
                            variant="minimal"
                            intent={feedback === "no" ? "danger" : "none"}
                            onClick={handleNo}
                            active={feedback === "no"}
                            size="small"
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
                <FeedbackFormDialog show={showFeedbackInput} targetRef={ref} onClose={handleClose}>
                    <FeedbackForm feedback={feedback} onSubmit={handleSubmitFeedback} />
                </FeedbackFormDialog>
            )}
        </div>
    );
};
