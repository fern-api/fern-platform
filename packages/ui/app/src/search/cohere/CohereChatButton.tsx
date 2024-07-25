import * as Dialog from "@radix-ui/react-dialog";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { ReactElement, useRef } from "react";
import { createPortal } from "react-dom";
import urlJoin from "url-join";
import { COHERE_ASK_AI, useBasePath } from "../../atoms";
import { useSearchConfig } from "../../services/useSearchService";
import { CohereChatInputBox } from "./CohereChatInputBox";

const GENERATED_TEXT_ATOM = atom<string>("");

export function CohereChatButton(): ReactElement | null {
    const [config] = useSearchConfig();
    const [enabled, setEnabled] = useAtom(COHERE_ASK_AI);
    const basePath = useBasePath();
    const ref = useRef<AbortController | null>(null);
    const setGeneratedText = useSetAtom(GENERATED_TEXT_ATOM);

    const handleSubmit = (_query: string) => {
        ref.current?.abort();
        ref.current = new AbortController();
        void fetch(urlJoin(basePath ?? "", "/api/fern-docs/search/cohere"), {
            method: "POST",
            signal: ref.current.signal,
        })
            .then(async (res) => {
                if (res.body == null) {
                    return;
                }
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let done = false;
                while (!done) {
                    const chunk = await reader.read();
                    done = chunk.done;
                    if (done) {
                        break;
                    }
                    const text = decoder.decode(chunk.value);
                    setGeneratedText((prev) => prev + text);
                }
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error(err);
            });
    };

    if (!config.isAvailable || config.inkeep != null || typeof window === "undefined") {
        return null;
    }

    return (
        <Dialog.Root open={enabled} onOpenChange={setEnabled}>
            {createPortal(
                <Dialog.Trigger asChild>
                    <button className="fixed bottom-0 right-0">Ask AI</button>
                </Dialog.Trigger>,
                document.body,
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-0 bg-background/50 backdrop-blur-sm max-sm:hidden" />
                <Dialog.Content className="fixed md:max-w-content-width my-[10vh] top-0 inset-x-0 z-10 mx-6 max-h-[80vh] md:mx-auto flex flex-col">
                    <GeneratedTextRenderer />
                    <CohereChatInputBox onSubmit={handleSubmit} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function GeneratedTextRenderer(): ReactElement {
    const generatedText = useAtomValue(GENERATED_TEXT_ATOM);

    return (
        <div className="flex-1 overflow-auto p-4 bg-background/90">
            <span>{generatedText}</span>
        </div>
    );
}
