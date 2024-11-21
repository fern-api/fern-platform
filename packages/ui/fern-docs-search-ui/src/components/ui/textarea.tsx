import { composeRefs } from "@radix-ui/react-compose-refs";
import { ComponentProps, RefObject, forwardRef, useEffect, useRef } from "react";

export const TextArea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>((props, forwardedRef) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    useAutosizeTextArea(inputRef);
    return <textarea ref={composeRefs(inputRef, forwardedRef)} {...props} />;
});

TextArea.displayName = "TextArea";

// Updates the height of a <textarea> when the value changes.
function useAutosizeTextArea(textAreaRef: RefObject<HTMLTextAreaElement>, minLines: number = 1): void {
    const minHeight = minLines * 20 + 20;
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
