import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useChat } from "ai/react";
import { SquarePen, X } from "lucide-react";
import {
    ComponentPropsWithoutRef,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    forwardRef,
    useEffect,
    useRef,
    useState,
} from "react";
import { type Components } from "react-markdown";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Composer } from "./composer";
import { ChatbotConversation } from "./conversation";
import { ChatbotModelSelect, useChatbotModels } from "./model-select";
import { combineSearchResults, squeezeMessages } from "./utils";

interface ChatbotDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    initialInput?: string;
    modal?: boolean;
    api?: string;
    headers?: Record<string, string>;
    components?: Components;
}

export function ChatbotDialog({
    children,
    open,
    onOpenChange,
    defaultOpen,
    modal,
    initialInput,
    api,
    headers,
    components,
}: PropsWithChildren<ChatbotDialogProps>): ReactElement {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
            {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-md" />

                <Dialog.Content className="fixed inset-0 flex flex-col items-stretch" asChild>
                    <ChatbotInterface initialInput={initialInput} api={api} headers={headers} components={components} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

const ChatbotInterface = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<"div"> & {
        initialInput?: string;
        aboveContent?: ReactNode;
        api?: string;
        headers?: Record<string, string>;
        components?: Components;
    }
>(({ initialInput, children, aboveContent, api, headers: _headers, components, ...props }, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const focus = () => {
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(inputRef.current?.value.length, inputRef.current?.value.length);
        }, 0);
    };

    const [model, setModel] = useState(useChatbotModels()[0]?.model);

    const { messages, input, handleInputChange, handleSubmit, setInput, setMessages, isLoading } = useChat({
        initialInput,
        api,
        headers: { ...(_headers ?? {}), "X-Fern-Docs-Model": model },
    });

    useEffect(() => {
        setInput(initialInput ?? "");
    }, [initialInput, setInput]);

    const squeezedMessages = squeezeMessages(messages);
    const searchResults = combineSearchResults(messages);

    return (
        <div
            ref={ref}
            {...props}
            onKeyDown={(e) => {
                if (e.altKey || e.metaKey || e.ctrlKey) {
                    return;
                }

                if (document.activeElement === inputRef.current) {
                    return;
                }

                if (/^[a-zA-Z0-9]$/.test(e.key)) {
                    setInput((prev) => prev + e.key);
                    focus();
                }
            }}
        >
            <div>
                <div className="px-6 py-4 max-md:px-4 fixed top-0 left-0">
                    <Dialog.Title className="text-xl font-semibold">Ask AI</Dialog.Title>
                    <VisuallyHidden asChild>
                        <Dialog.Description>Ask AI any questions you have about our documentation.</Dialog.Description>
                    </VisuallyHidden>
                </div>
                <div className="p-4 max-md:px-2 flex gap-2 fixed right-0 top-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <SquarePen />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>New chat</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Dialog.Close asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full"
                                        onClick={() => {
                                            setMessages([]);
                                        }}
                                    >
                                        <X />
                                    </Button>
                                </Dialog.Close>
                            </TooltipTrigger>
                            <TooltipContent className="flex items-center gap-2">
                                <p>Close</p>
                                <Kbd>Esc</Kbd>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <ChatbotConversation
                isLoading={isLoading}
                messages={squeezedMessages}
                components={components}
                searchResults={searchResults}
            />
            <div className="max-w-3xl w-screen m-auto shrink-0 max-md:px-4">
                <Composer value={input} onChange={handleInputChange} onSubmit={handleSubmit} autoFocus ref={inputRef}>
                    <ChatbotModelSelect value={model} onValueChange={setModel} />
                </Composer>
            </div>
            <div className="relative w-full p-2 text-center text-xs text-muted-foreground empty:hidden md:px-[60px]">
                <div className="h-2" />
            </div>
        </div>
    );
});

ChatbotInterface.displayName = "ChatbotInterface";
