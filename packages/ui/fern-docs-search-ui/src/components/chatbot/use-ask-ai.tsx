import { useChat } from "ai/react";
import { template } from "es-toolkit/compat";
import { useAtom, useAtomValue } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { Dispatch, SetStateAction } from "react";
import { createDefaultSystemPrompt } from "./system-prompt";

const systemAtom = atomWithDefault(createDefaultSystemPrompt);

export function useSystemPrompt(): [string, Dispatch<SetStateAction<string>>] {
    return useAtom(systemAtom);
}

export interface UseAskAIOpts {
    api?: string;
    initialInput?: string;
    headers?: Record<string, string>;
    model?: string;
    systemContext?: Record<string, string>;
}

export function useAskAI({
    api,
    initialInput,
    headers,
    model = "gpt-4o-mini",
    systemContext,
}: UseAskAIOpts): ReturnType<typeof useChat> {
    const system = useAtomValue(systemAtom);
    const compiled = template(system, {
        interpolate: /{{([^}]+)}}/g,
    });
    return useChat({
        api: api ?? "/api/chat",
        initialInput,
        headers,
        body: {
            model,
            system: compiled({
                ...systemContext,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            }),
        },
    });
}
