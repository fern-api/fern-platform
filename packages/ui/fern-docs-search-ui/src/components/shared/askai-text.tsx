import { forwardRef } from "react";

export const AskAIText = forwardRef<HTMLSpanElement, { query: string }>(({ query }, ref) => {
    return (
        <span ref={ref} className="whitespace-nowrap inline-flex items-baseline overflow-hidden">
            Ask AI
            {query.trimStart().length > 0 && (
                <>
                    <span className="ms-1">&ldquo;</span>
                    <span className="font-semibold text-ellipsis shrink min-w-0 overflow-hidden">{query}</span>
                    <span>&rdquo;</span>
                </>
            )}
        </span>
    );
});

AskAIText.displayName = "AskAIText";
