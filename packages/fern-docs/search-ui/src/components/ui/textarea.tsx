import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  ComponentProps,
  RefObject,
  forwardRef,
  useEffect,
  useRef,
} from "react";

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & {
    onValueChange?: (value: string) => void;
    minLines?: number;
    maxLines?: number;
    lineHeight?: number;
    padding?: number;
  }
>(
  (
    {
      onValueChange,
      minLines,
      maxLines,
      lineHeight = 20,
      padding = 0,
      ...props
    },
    forwardedRef
  ) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    useAutosizeTextArea(inputRef, minLines, lineHeight);
    return (
      <textarea
        ref={composeRefs(inputRef, forwardedRef)}
        {...props}
        onChange={composeEventHandlers(props.onChange, (e) =>
          onValueChange?.(e.target.value)
        )}
        style={{
          padding: `${padding}px`,
          maxHeight: maxLines
            ? `${maxLines * lineHeight + padding * 2}px`
            : undefined,
          ...props.style,
        }}
      />
    );
  }
);

TextArea.displayName = "TextArea";

// Updates the height of a <textarea> when the value changes.
function useAutosizeTextArea(
  textAreaRef: RefObject<HTMLTextAreaElement>,
  minLines: number = 1,
  lineHeight: number = 20,
  padding: number = 0
): void {
  const minHeight =
    Math.max(minLines, 1) * Math.max(lineHeight, 10) + padding * 2;
  useEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) {
      return;
    }

    const handleInput = () => {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textArea.style.height = "0px";
      const scrollHeight = textArea.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textArea.style.height = Math.max(minHeight, scrollHeight) + "px";
    };

    handleInput();

    textArea.addEventListener("input", handleInput);
    return () => {
      textArea.removeEventListener("input", handleInput);
    };
  }, [minHeight, textAreaRef]);
}
