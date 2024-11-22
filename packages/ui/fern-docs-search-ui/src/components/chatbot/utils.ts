import { isNonNullish } from "@fern-api/ui-core-utils";
import { ToolInvocation } from "ai";
import { Message } from "ai/react";
import { z } from "zod";

const SearchResult = z.object({
    title: z.string(),
    url: z.string(),
    icon: z.string().optional(),
    type: z.string(),
    api_type: z.string().optional(),
});

export type SearchResult = z.infer<typeof SearchResult>;

export function squeezeMessages(
    messages: Message[],
): { id: string; createdAt?: Date; role: "assistant" | "user"; content: string; isThinking?: boolean }[] {
    const squeezed: {
        id: string;
        createdAt?: Date;
        role: "assistant" | "user";
        content: string;
        toolInvocations?: ToolInvocation[];
    }[] = [];

    for (const message of messages) {
        if (message.role === "assistant" && message.content.trimStart().length > 0) {
            if (squeezed.length > 0 && squeezed[squeezed.length - 1].role === "assistant") {
                const lastContent = squeezed[squeezed.length - 1].content;
                squeezed[squeezed.length - 1].content = [lastContent, message.content]
                    .filter((content) => content.trimStart().length > 0)
                    .join("\n\n");

                // merge tool invocations
                squeezed[squeezed.length - 1].toolInvocations = [
                    ...(squeezed[squeezed.length - 1].toolInvocations ?? []),
                    ...(message.toolInvocations ?? []),
                ];
            } else {
                squeezed.push({
                    id: message.id,
                    createdAt: message.createdAt,
                    role: message.role,
                    content: message.content,
                    toolInvocations: message.toolInvocations,
                });
            }
        }

        if (message.role === "user") {
            squeezed.push({
                id: message.id,
                createdAt: message.createdAt,
                role: message.role,
                content: message.content,
            });
        }
    }

    return squeezed.map(({ toolInvocations, ...message }) => ({
        ...message,
        isThinking: toolInvocations?.some((invocation) => invocation.state !== "result"),
    }));
}

export function combineSearchResults(messages: Message[]): SearchResult[] {
    return messages
        .flatMap((message) => message.toolInvocations ?? [])
        .flatMap((invocation) =>
            invocation.state === "result" && invocation.toolName === "search" && Array.isArray(invocation.result)
                ? invocation.result
                : [],
        )
        .map((result) => SearchResult.safeParse(result).data)
        .filter(isNonNullish);
}
