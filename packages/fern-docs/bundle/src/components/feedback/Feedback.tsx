"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";

import { ThumbsDown, ThumbsUp } from "lucide-react";

import { Button, cn } from "@fern-docs/components";
import { toast } from "@fern-docs/components";
import { useKeyboardPress } from "@fern-ui/react-commons";

import { useCurrentPathname } from "@/hooks/use-current-pathname";

import { track } from "../analytics";
import { registerPosthogProperties } from "../analytics/posthog";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackFormDialog } from "./FeedbackFormDialog";

export interface FeedbackProps {
  className?: string;
  type?: string;
  feedbackQuestion?: string;
  metadata?: Record<string, unknown> | (() => Record<string, unknown>);
  pathname?: string;
}

export const Feedback: FC<FeedbackProps> = ({
  className,
  feedbackQuestion = "Was this page helpful?",
  type = "on-page-feedback",
  metadata,
  pathname: pathnameProp,
}) => {
  const [sent, setSent] = useState(false);
  const [isHelpful, setIsHelpful] = useState<"yes" | "no" | undefined>();
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentPathname = useCurrentPathname();
  const pathname = pathnameProp ?? currentPathname;

  useEffect(() => {
    setSent(false);
    setIsHelpful(undefined);
    setShowFeedbackInput(false);
  }, [pathname]);

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
        <div className="flex flex-wrap items-center justify-start gap-4">
          <span className="text-(color:--grayscale-a11) text-sm font-medium">
            {feedbackQuestion}
          </span>
          <div className="flex gap-2">
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
                <Button
                  variant={isHelpful === "yes" ? "outlineSuccess" : "outline"}
                  onClick={handleYes}
                  size="sm"
                >
                  <ThumbsUp
                    className={cn({
                      "animate-thumb-rock": isHelpful === "yes",
                    })}
                  />
                  Yes
                </Button>
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
                <Button
                  variant={isHelpful === "no" ? "outlineDanger" : "outline"}
                  onClick={handleNo}
                  size="sm"
                >
                  <ThumbsDown
                    className={cn({
                      "animate-thumb-rock": isHelpful === "no",
                    })}
                  />
                  No
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex h-6 items-center">
          <span className="text-(color:--grayscale-a11) text-xs">
            Thank you for your feedback!
          </span>
        </div>
      )}
    </div>
  );
};
