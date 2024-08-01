import { FernTextarea } from "@fern-ui/components";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

interface CohereChatInputBoxProps {
    onSubmit: (query: string) => void;
}

export const CohereChatInputBox = forwardRef<HTMLTextAreaElement, CohereChatInputBoxProps>(({ onSubmit }, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(ref, () => inputRef.current!);

    const [query, setQuery] = useState("");
    return (
        <form
            action=""
            role="search"
            noValidate
            onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSubmit(query);
                setQuery("");
                inputRef.current?.focus();
            }}
            onReset={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setQuery("");
                inputRef.current?.focus();
            }}
        >
            <FernTextarea
                ref={ref}
                value={query}
                onValueChange={setQuery}
                role="searchbox"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Ask AI anything..."
                minLines={1}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.stopPropagation();
                        onSubmit(query);
                        setQuery("");
                    }
                }}
            />
        </form>
    );
});

CohereChatInputBox.displayName = "CohereChatInputBox";
