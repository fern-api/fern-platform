import { Badge } from "@fern-ui/components/badges";
import { Sparkles } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useSearchBox } from "react-instantsearch";
import * as Command from "../cmdk";

export const CommandAskAIGroup = forwardRef<
    HTMLDivElement,
    { onAskAI: (initialInput: string) => void } & ComponentPropsWithoutRef<typeof Command.Group>
>(({ onAskAI, ...props }, ref) => {
    const { query } = useSearchBox();
    return (
        <Command.Group ref={ref} {...props}>
            <Command.Item onSelect={() => onAskAI(query)}>
                <Sparkles />
                <AskAIText query={query.trim().split(/\s+/).length < 2 ? "" : query.trim()} />
                <Badge rounded className="ml-auto" size="sm">
                    Experimental
                </Badge>
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
