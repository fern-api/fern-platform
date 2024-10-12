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
    const config = useSearchConfig();
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
                    <button className="fixed bottom-6 right-6 bg-background px-5 py-3 rounded-full border border-default inline-flex gap-2 items-center">
                        <CohereIcon />
                        <span>Ask Cohere</span>
                    </button>
                </Dialog.Trigger>,
                document.body,
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-0 bg-background/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed md:max-w-content-width my-[10vh] top-0 inset-x-0 mx-6 max-h-[80vh] md:mx-auto flex flex-col">
                    <CohereChatbotModal className="bg-search-dialog border-default flex h-auto min-h-0 shrink flex-col overflow-hidden rounded-xl border text-left align-middle shadow-2xl backdrop-blur-lg" />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
