import {
  CopyToClipboardButton,
  FernButton,
  FernButtonGroup,
  toast,
} from "@fern-docs/components";
import { useKeyboardPress } from "@fern-ui/react-commons";
import clsx from "clsx";
import { ThumbsDown, ThumbsUp } from "iconoir-react";
import { Router } from "next/router";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { track } from "../analytics";
import { registerPosthogProperties } from "../analytics/posthog";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackFormDialog } from "./FeedbackFormDialog";

export interface FeedbackProps {
  className?: string;
  type?: string;
  feedbackQuestion?: string;
  metadata?: Record<string, unknown> | (() => Record<string, unknown>);
}

export const Feedback: FC<FeedbackProps> = ({
  className,
  feedbackQuestion = "Was this page helpful?",
  type = "on-page-feedback",
  metadata,
}) => {
  const [sent, setSent] = useState(false);
  const [isHelpful, setIsHelpful] = useState<"yes" | "no" | undefined>();
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
    setIsHelpful("yes");
    setShowFeedbackInput(true);
    textareaRef.current?.focus();
    track("feedback_voted", {
      satisfied: true,
      feedbackQuestion,
      type,
      ...(typeof metadata === "function" ? metadata() : metadata),
    });
  };
  const handleNo = () => {
    setIsHelpful("no");
    setShowFeedbackInput(true);
    textareaRef.current?.focus();
    track("feedback_voted", {
      satisfied: false,
      feedbackQuestion,
      type,
      ...(typeof metadata === "function" ? metadata() : metadata),
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
      track("feedback_submitted", {
        // satisfied must be a boolean because it's how the zapier integration is set
        satisfied:
          isHelpful === "yes" ? true : isHelpful === "no" ? false : undefined,
        feedback: feedbackId,
        message: feedbackMessage,
        email,
        allowFollowUpViaEmail: showEmailInput === true,
        feedbackQuestion,
        type,
        ...(typeof metadata === "function" ? metadata() : metadata),
      });
      toast.success("Thank you for submitting feedback!");
      setSent(true);
    },
    [isHelpful, metadata, feedbackQuestion, type]
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
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex items-center justify-start gap-2">
            <span className="t-muted text-sm font-medium">
              {feedbackQuestion}
            </span>
            <FernButtonGroup>
              <FeedbackFormDialog
                content={
                  isHelpful && (
                    <FeedbackForm
                      isHelpful={isHelpful}
                      onSubmit={handleSubmitFeedback}
                    />
                  )
                }
                trigger={
                  <FernButton
                    icon={
                      <ThumbsUp
                        className={clsx({
                          "animate-thumb-rock": isHelpful === "yes",
                        })}
                      />
                    }
                    variant="outlined"
                    intent={isHelpful === "yes" ? "success" : "none"}
                    onClick={handleYes}
                    active={isHelpful === "yes"}
                  >
                    Yes
                  </FernButton>
                }
              />
              <FeedbackFormDialog
                content={
                  isHelpful && (
                    <FeedbackForm
                      isHelpful={isHelpful}
                      onSubmit={handleSubmitFeedback}
                    />
                  )
                }
                trigger={
                  <FernButton
                    icon={
                      <ThumbsDown
                        className={clsx({
                          "animate-thumb-rock": isHelpful === "no",
                        })}
                      />
                    }
                    variant="outlined"
                    intent={isHelpful === "no" ? "danger" : "none"}
                    onClick={handleNo}
                    active={isHelpful === "no"}
                  >
                    No
                  </FernButton>
                }
              />
            </FernButtonGroup>
          </div>
          <CopyToClipboardButton
            content={
              typeof metadata === "function"
                ? (metadata().assistant as string)
                : (metadata?.assistant as string | undefined)
            }
          />
        </div>
      ) : (
        <div className="flex h-6 items-center">
          <span className="t-muted text-xs">Thank you for your feedback!</span>
          <CopyToClipboardButton
            className="float-right"
            content={
              typeof metadata === "function"
                ? (metadata().assistant as string)
                : (metadata?.assistant as string | undefined)
            }
          />
        </div>
      )}
    </div>
  );
};
