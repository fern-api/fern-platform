"use client";

import { ComponentProps, forwardRef, useEffect, useRef } from "react";

import { composeRefs } from "@radix-ui/react-compose-refs";

import { cn } from "./cn";

interface FernTextareaProps extends ComponentProps<"textarea"> {
  onValueChange?: (value: string) => void;
  value?: string;
  minLines?: number;
}
export const FernTextarea = forwardRef<HTMLTextAreaElement, FernTextareaProps>(
  function FernTextarea(
    { className, onValueChange, minLines = 2, ...props },
    forwardedRef
  ) {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onValueChange?.(e.target.value);
      props.onChange?.(e);
    };
    useAutosizeTextArea(inputRef.current, props.value ?? "", minLines);
    return (
      <div className={cn("fern-textarea-group", className)}>
        <textarea
          {...props}
          ref={composeRefs(inputRef, forwardedRef)}
          className="fern-textarea"
          onChange={handleChange}
        />
      </div>
    );
  }
);

// Updates the height of a <textarea> when the value changes.
function useAutosizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
  minLines: number
): void {
  const minHeight = minLines * 20 + 16;
  useEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = Math.max(minHeight, scrollHeight) + "px";
    }
  }, [minHeight, textAreaRef, value]);
}
