import { Sparkles } from "lucide-react";

import { Command } from "cmdk";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const CommandAskAIGroup = forwardRef<
    HTMLDivElement,
    { query: string; onAskAI: ({ initialInput }: { initialInput: string }) => void } & ComponentPropsWithoutRef<
        typeof Command.Group
    >
>(({ query, onAskAI, ...props }, ref) => {
    return (
        <Command.Group ref={ref} {...props}>
            <Command.Item onSelect={() => onAskAI?.({ initialInput: query })}>
                <Sparkles />
                <AskAIText query={query} />
            </Command.Item>
        </Command.Group>
    );
});

CommandAskAIGroup.displayName = "CommandAskAIGroup";

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
