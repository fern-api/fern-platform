import { CohereIcon } from "@fern-ui/chatbot";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom } from "jotai";
import { ReactElement } from "react";
import { createPortal } from "react-dom";
import { COHERE_ASK_AI } from "../../atoms";
import { useRouteChangeComplete } from "../../hooks/useRouteChanged";
import { useSearchConfig } from "../../services/useSearchService";
import { CohereChatbotModal } from "./CohereChatbotModal";

export function CohereChatButton(): ReactElement | null {
    const [config] = useSearchConfig();
    const [enabled, setEnabled] = useAtom(COHERE_ASK_AI);

    // Close the dialog when the route changes
    useRouteChangeComplete(() => {
        setEnabled(false);
    });

    if (!config.isAvailable || config.inkeep != null || typeof window === "undefined") {
        return null;
    }

    return (
        <Dialog.Root open={enabled} onOpenChange={setEnabled}>
            {createPortal(
                <Dialog.Trigger asChild>
                    <button className="bg-background border-default fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full border px-5 py-3">
                        <CohereIcon />
                        <span>Ask Cohere</span>
                    </button>
                </Dialog.Trigger>,
                document.body,
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="bg-background/50 fixed inset-0 z-0 backdrop-blur-sm" />
                <Dialog.Content className="md:max-w-content-width fixed inset-x-0 top-0 mx-6 my-[10vh] flex max-h-[80vh] flex-col md:mx-auto">
                    <CohereChatbotModal className="bg-search-dialog border-default flex h-auto min-h-0 shrink flex-col overflow-hidden rounded-xl border text-left align-middle shadow-2xl backdrop-blur-lg" />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
