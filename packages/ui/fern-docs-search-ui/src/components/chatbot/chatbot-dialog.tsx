import { Kbd } from "@fern-ui/components";
import { composeRefs } from "@radix-ui/react-compose-refs";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { atom, useAtom } from "jotai";
import { Cog, SquarePen, X } from "lucide-react";
import {
    ComponentPropsWithoutRef,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    RefObject,
    forwardRef,
    useEffect,
    useRef,
    useState,
} from "react";
import { type Components } from "react-markdown";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Composer } from "./composer";
import { ChatbotConversation } from "./conversation";
import { ChatbotModelSelect, useChatbotModels } from "./model-select";
import { SystemPromptDialog } from "./system-prompt-dialog";
import { combineSearchResults } from "./utils";

interface ChatbotDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    initialInput?: string;
    modal?: boolean;
    api?: string;
    headers?: Record<string, string>;
    systemContext?: Record<string, string>;
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
    systemContext,
    components,
}: PropsWithChildren<ChatbotDialogProps>): ReactElement {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal={modal}>
            {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-[var(--grayscale-1)]/80 backdrop-blur-md" />

                <Dialog.Content className="fixed inset-0 flex flex-col items-stretch" asChild>
                    <ChatbotInterface
                        initialInput={initialInput}
                        api={api}
                        headers={headers}
                        systemContext={systemContext}
                        components={components}
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

const modelAtom = atom<string | undefined>(undefined);

const ChatbotInterface = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<"div"> & {
        initialInput?: string;
        aboveContent?: ReactNode;
        api?: string;
        headers?: Record<string, string>;
        systemContext?: Record<string, string>;
        components?: Components;
        inputRef?: RefObject<HTMLTextAreaElement>;
    }
>(
    (
        {
            initialInput,
            children,
            aboveContent,
            api,
            headers,
            systemContext,
            components,
            inputRef: _inputRef,
            ...props
        },
        ref,
    ) => {
        const inputRef = useRef<HTMLTextAreaElement>(null);

        const focus = () => {
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.setSelectionRange(inputRef.current?.value.length, inputRef.current?.value.length);
            }, 0);
        };

        const defaultModel = useChatbotModels()[0]?.model;
        const [model = defaultModel, setModel] = useAtom(modelAtom);
        // const [system, setSystem] = useSystemPrompt();
        const [systemDialogOpen, setSystemDialogOpen] = useState(false);

        // const { messages, input, handleInputChange, handleSubmit, setInput, setMessages, isLoading } = useAskAI({
        //     api,
        //     initialInput,
        //     headers,
        //     model,
        //     systemContext,
        // });

        // useEffect(() => {
        //     setInput(initialInput ?? "");
        // }, [initialInput, setInput]);

        // const squeezedMessages = squeezeMessages([]);
        const searchResults = combineSearchResults([]);

        useEffect(() => {
            focus();
        }, []);

        return (
            <div
                ref={ref}
                {...props}
                onKeyDown={(e) => {
                    if (systemDialogOpen) {
                        return;
                    }

                    if (e.altKey || e.metaKey || e.ctrlKey) {
                        return;
                    }

                    if (document.activeElement === inputRef.current) {
                        return;
                    }

                    if (/^[a-zA-Z0-9]$/.test(e.key)) {
                        // setInput((prev) => prev + e.key);
                        focus();
                    }
                }}
            >
                <div className="absolute top-0 inset-x-0 z-50">
                    <div className="px-6 py-4 max-md:px-3 fixed top-0 left-0">
                        <Dialog.Title className="text-xl font-semibold">Ask AI</Dialog.Title>
                        <VisuallyHidden asChild>
                            <Dialog.Description>
                                Ask AI any questions you have about our documentation.
                            </Dialog.Description>
                        </VisuallyHidden>
                    </div>
                    <div className="p-4 max-md:p-3 flex gap-2 fixed right-0 top-0">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full">
                                        <SquarePen />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent collisionPadding={10}>
                                    <p>New chat</p>
                                </TooltipContent>
                            </Tooltip>

                            <SystemPromptDialog
                                // value={system}
                                // onValueChange={setSystem}
                                open={systemDialogOpen}
                                onOpenChange={setSystemDialogOpen}
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="rounded-full">
                                                <Cog />
                                            </Button>
                                        </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent collisionPadding={10}>
                                        <p>Update system prompt</p>
                                    </TooltipContent>
                                </Tooltip>
                            </SystemPromptDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Dialog.Close asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                            // onClick={() => {
                                            //     setMessages([]);
                                            // }}
                                        >
                                            <X />
                                        </Button>
                                    </Dialog.Close>
                                </TooltipTrigger>
                                <TooltipContent className="flex items-center gap-2" collisionPadding={10}>
                                    <p>Close</p>
                                    <Kbd>Esc</Kbd>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <ChatbotConversation
                    isLoading={false}
                    messages={[]}
                    components={components}
                    searchResults={searchResults}
                />
                <div className="max-w-3xl w-screen m-auto shrink-0 max-md:px-3">
                    <Composer
                        // value={input}
                        // onChange={handleInputChange}
                        // onSubmit={handleSubmit}
                        autoFocus
                        ref={composeRefs(inputRef, _inputRef)}
                    >
                        <ChatbotModelSelect value={model} onValueChange={setModel} />
                    </Composer>
                </div>
                <div className="relative w-full p-2 text-center text-xs text-[var(--grayscale-a3)] empty:hidden md:px-[60px]">
                    <div className="h-2" />
                </div>
            </div>
        );
    },
);

ChatbotInterface.displayName = "ChatbotInterface";
