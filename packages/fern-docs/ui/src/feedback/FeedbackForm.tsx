import {
  FernButton,
  FernCheckbox,
  FernDropdown,
  FernInput,
  FernRadioGroup,
  FernTextarea,
} from "@fern-docs/components";
import { useKeyboardPress } from "@fern-ui/react-commons";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { FC, FormEvent, useCallback, useMemo, useRef, useState } from "react";

const MotionFernRadioGroup = motion(FernRadioGroup);

interface FeedbackFormProps {
  isHelpful: "yes" | "no";
  onSubmit: (feedback: {
    feedbackId: string;
    feedbackMessage: string;
    email: string;
    showEmailInput: boolean | "indeterminate";
  }) => void;
  layoutDensity?: "condensed" | "verbose";
}

const SHOW_EMAIL_INPUT_ATOM = atomWithStorage<boolean | "indeterminate">(
  "feedback-show-email-input",
  false
);
const EMAIL_ATOM = atomWithStorage<string>("feedback-email", "");

export const FeedbackForm: FC<FeedbackFormProps> = ({
  isHelpful,
  onSubmit,
  layoutDensity = "verbose",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackId, setFeedbackId] = useState<string>();
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [showEmailInput, setShowEmailInput] = useAtom(SHOW_EMAIL_INPUT_ATOM);
  const [email, setEmail] = useAtom(EMAIL_ATOM);

  const legend = isHelpful
    ? "What did you like?"
    : isHelpful === "no"
      ? "What went wrong?"
      : "Feedback";
  const feedbackOptions = useMemo<FernDropdown.Option[]>(() => {
    const options =
      isHelpful === "yes"
        ? POSITIVE_FEEDBACK
        : isHelpful === "no"
          ? NEGATIVE_FEEDBACK
          : [];
    const transformedOptions: FernDropdown.Option[] = options.map(
      (option): FernDropdown.Option => ({
        type: "value",
        value: option.feedbackId,
        label: option.title,
        helperText: layoutDensity === "verbose" && option.description,
        children: (active) =>
          active && layoutDensity === "verbose" ? (
            <FernTextarea
              ref={textareaRef}
              // autoFocus={true}
              className="mt-2 w-full"
              placeholder="(Optional) Tell us more about your experience"
              onValueChange={setFeedbackMessage}
              value={feedbackMessage}
            />
          ) : null,
      })
    );

    if (transformedOptions.length > 0 && layoutDensity === "verbose") {
      transformedOptions.push({
        type: "value",
        value: "other",
        label: "Another reason",
        children: (active) =>
          active ? (
            <FernTextarea
              ref={textareaRef}
              autoFocus={true}
              className="mt-2 w-full"
              placeholder="Tell us more about your experience"
              onValueChange={setFeedbackMessage}
              value={feedbackMessage}
            />
          ) : null,
      });
    }
    return transformedOptions;
  }, [isHelpful, feedbackMessage, layoutDensity]);

  useKeyboardPress({
    key: "Escape",
    onPress: useCallback((e) => {
      if (textareaRef.current === document.activeElement) {
        textareaRef.current?.blur();
        e.stopImmediatePropagation();
      }
    }, []),
    capture: true,
  });

  const handleSubmitFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (feedbackId == null) {
      return;
    }
    onSubmit({
      feedbackId,
      feedbackMessage,
      email,
      showEmailInput,
    });
  };

  return (
    <form onSubmit={handleSubmitFeedback} className="p-0">
      <label
        htmlFor="feedbackReason"
        className={clsx({
          "text-lg font-semibold": layoutDensity === "verbose",
          "t-muted text-sm font-medium": layoutDensity === "condensed",
        })}
      >
        {legend}
      </label>

      {feedbackOptions.length > 0 ? (
        <MotionFernRadioGroup
          layoutId={legend}
          id="feedbackReason"
          className="mt-4"
          value={feedbackId}
          onValueChange={setFeedbackId}
          options={feedbackOptions}
          autoFocus={true}
          compact={layoutDensity === "condensed"}
        />
      ) : (
        <FernTextarea
          ref={textareaRef}
          className="mt-2 w-full"
          placeholder="Help us improve the docs"
          onValueChange={setFeedbackMessage}
          value={feedbackMessage}
        />
      )}

      {layoutDensity === "verbose" && (
        <>
          <hr className="border-border-concealed my-4" />

          <div className="mt-4">
            <FernCheckbox
              label="Yes, it's okay to follow up by email."
              checked={showEmailInput}
              onCheckedChange={setShowEmailInput}
              autoFocus={false}
            >
              {showEmailInput && (
                <FernInput
                  className="mt-2"
                  type="email"
                  placeholder="yourname@email.com"
                  value={email}
                  onValueChange={setEmail}
                />
              )}
            </FernCheckbox>
          </div>
        </>
      )}

      <FernButton
        full={true}
        intent="primary"
        className="mt-4 rounded-md"
        type="submit"
        disabled={feedbackId == null}
        size={layoutDensity === "verbose" ? "large" : "normal"}
      >
        Send feedback
      </FernButton>
    </form>
  );
};

interface FeedbackItem {
  feedbackId: string;
  title: string;
  description: string;
  satisfied: boolean;
}

export const POSITIVE_FEEDBACK: FeedbackItem[] = [
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

export const NEGATIVE_FEEDBACK: FeedbackItem[] = [
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
