import { ChatbotMessage, ChatbotModal, CohereIcon } from "@fern-ui/chatbot";
import * as Dialog from "@radix-ui/react-dialog";
import type { Cohere } from "cohere-ai";
import { useAtom } from "jotai";
import { ReactElement } from "react";
import { createPortal } from "react-dom";
import urlJoin from "url-join";
import { Stream } from "../../api-playground/Stream";
import { COHERE_ASK_AI, useBasePath } from "../../atoms";
import { useSearchConfig } from "../../services/useSearchService";

export function CohereChatButton(): ReactElement | null {
    const [config] = useSearchConfig();
    const [enabled, setEnabled] = useAtom(COHERE_ASK_AI);
    const basePath = useBasePath();

    const chatStream = async (message: string, conversationId: string) => {
        const abortController = new AbortController();
        const body = await fetch(urlJoin(basePath || "/", "/api/fern-docs/search/cohere"), {
            method: "POST",
            signal: abortController.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ conversationId, message }),
        }).then((res) => res.body);

        if (body == null) {
            return [undefined, abortController] as const;
        }

        let text = "";

        const stream = new Stream<ChatbotMessage>({
            stream: body,
            parse: async (val) => {
                const event = val as Cohere.StreamedChatResponse;
                if (event.eventType === "text-generation") {
                    text += event.text;
                }
                return { message: text, role: "AI", citations: [] };
            },
            terminator: "\n",
        });

        return [stream, abortController] as const;
    };

    if (!config.isAvailable || config.inkeep != null || typeof window === "undefined") {
        return null;
    }

    return (
        <Dialog.Root open={enabled} onOpenChange={setEnabled}>
            {createPortal(
                <Dialog.Trigger asChild>
                    <button className="fixed bottom-6 right-6 bg-background px-5 py-3 rounded-full border border-default inline-flex gap-2 items-center">
                        <CohereIcon />
                        <span>Ask AI</span>
                    </button>
                </Dialog.Trigger>,
                document.body,
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-0 bg-background/50 backdrop-blur-sm max-sm:hidden" />
                <Dialog.Content className="fixed md:max-w-content-width my-[10vh] top-0 inset-x-0 z-10 mx-6 max-h-[80vh] md:mx-auto flex flex-col">
                    <ChatbotModal
                        chatStream={chatStream}
                        className="bg-search-dialog border-default flex h-auto min-h-0 shrink flex-col overflow-hidden rounded-xl border text-left align-middle shadow-2xl backdrop-blur-lg"
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
