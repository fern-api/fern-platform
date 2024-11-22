import { isNonNullish } from "@fern-api/ui-core-utils";
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
): { id: string; createdAt?: Date; role: "assistant" | "user"; content: string }[] {
    const squeezed: { id: string; createdAt?: Date; role: "assistant" | "user"; content: string }[] = [];

    for (const message of messages) {
        if (message.role === "assistant" && message.content.trimStart().length > 0) {
            if (squeezed.length > 0 && squeezed[squeezed.length - 1].role === "assistant") {
                squeezed[squeezed.length - 1].content += " " + message.content;
            } else {
                squeezed.push({
                    id: message.id,
                    createdAt: message.createdAt,
                    role: message.role,
                    content: message.content,
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

    return squeezed;
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
