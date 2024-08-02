import { ComponentProps, forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export const TextArea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>((props, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);
    useAutosizeTextArea(inputRef.current, props.value);
    return <textarea ref={inputRef} {...props} />;
});

// Updates the height of a <textarea> when the value changes.
function useAutosizeTextArea(
    textAreaRef: HTMLTextAreaElement | null,
    value: string | number | readonly string[] | undefined,
    minLines: number = 1,
): void {
    const minHeight = minLines * 20 + 20;
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
