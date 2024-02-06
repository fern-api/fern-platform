import classNames from "classnames";
import { DetailedHTMLProps, forwardRef, InputHTMLAttributes, useEffect, useImperativeHandle, useRef } from "react";

interface FernTextareaProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
    onValueChange?: (value: string) => void;
    value?: string;
    minLines?: number;
}
export const FernTextarea = forwardRef<HTMLTextAreaElement, FernTextareaProps>(function FernTextarea(
    { className, onValueChange, minLines = 2, ...props },
    ref,
) {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(ref, () => inputRef.current!);
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange?.(e.target.value);
        props.onChange?.(e);
    };
    useAutosizeTextArea(inputRef.current, props.value ?? "", minLines);
    return (
        <textarea
            {...props}
            ref={inputRef}
            className={classNames(
                className,
                "border-border-default-light dark:border-border-default-dark focus-visible:ring-tag-primary-light focus-visible:dark:ring-tag-primary-dark focus-visible:border-accent-primary caret-accent-primary-light dark:caret-accent-primary-dark rounded-md border bg-white p-2 text-sm focus:outline-none focus-visible:ring-4 dark:bg-white/10 resize-none",
            )}
            onChange={handleChange}
        />
    );
});

// Updates the height of a <textarea> when the value changes.
function useAutosizeTextArea(textAreaRef: HTMLTextAreaElement | null, value: string, minLines: number): void {
    const minHeight = minLines * 20 + 18;
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
