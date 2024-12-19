import { FernButton, FernButtonGroup, toast } from "@fern-docs/components";
import { useKeyboardPress } from "@fern-ui/react-commons";
import clsx from "clsx";
import { ThumbsDown, ThumbsUp } from "iconoir-react";
import { Router } from "next/router";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  capturePosthogEvent,
  registerPosthogProperties,
} from "../analytics/posthog";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackFormDialog } from "./FeedbackFormDialog";

export interface FeedbackProps {
  className?: string;
}

export const Feedback: FC<FeedbackProps> = ({ className }) => {
  const [sent, setSent] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean>();
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const resetForm = () => {
      setSent(false);
      setIsHelpful(undefined);
      setShowFeedbackInput(false);
    };
    Router.events.on("routeChangeComplete", resetForm);
    return () => {
      Router.events.off("routeChangeComplete", resetForm);
    };
  }, []);

  const handleYes = () => {
    setIsHelpful(true);
    setShowFeedbackInput(true);
    textareaRef.current?.focus();
    capturePosthogEvent("feedback_voted", {
      satisfied: true,
    });
  };
  const handleNo = () => {
    setIsHelpful(false);
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
        satisfied: isHelpful ? true : false,
        feedback: feedbackId,
        message: feedbackMessage,
        email,
        allowFollowUpViaEmail: showEmailInput === true,
      });
      toast.success("Thank you for submitting feedback!");
      setSent(true);
    },
    [isHelpful]
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
    <div className={className} ref={ref}>
      {!sent ? (
        <div className="flex items-center justify-start flex-wrap gap-4">
          <span className="t-muted text-sm font-medium">
            Was this page helpful?
          </span>
          <FernButtonGroup>
            <FeedbackFormDialog
              content={
                <FeedbackForm
                  isHelpful={isHelpful}
                  onSubmit={handleSubmitFeedback}
                />
              }
              trigger={
                <FernButton
                  icon={
                    <ThumbsUp
                      className={clsx({
                        "animate-thumb-rock": isHelpful,
                      })}
                    />
                  }
                  variant="outlined"
                  intent={isHelpful ? "success" : "none"}
                  onClick={handleYes}
                  active={isHelpful}
                >
                  Yes
                </FernButton>
              }
            />
            <FeedbackFormDialog
              content={
                <FeedbackForm
                  isHelpful={isHelpful}
                  onSubmit={handleSubmitFeedback}
                />
              }
              trigger={
                <FernButton
                  icon={
                    <ThumbsDown
                      className={clsx({
                        "animate-thumb-rock": isHelpful === false,
                      })}
                    />
                  }
                  variant="outlined"
                  intent={isHelpful === false ? "danger" : "none"}
                  onClick={handleNo}
                  active={isHelpful === false}
                >
                  No
                </FernButton>
              }
            />
          </FernButtonGroup>
        </div>
      ) : (
        <div className="flex h-6 items-center">
          <span className="t-muted text-xs">Thank you for your feedback!</span>
        </div>
      )}
    </div>
  );
};
