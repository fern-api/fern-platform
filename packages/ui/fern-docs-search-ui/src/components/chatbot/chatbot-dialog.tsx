import { composeRefs } from "@radix-ui/react-compose-refs";
import * as Dialog from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useChat } from "ai/react";
import { ArrowUp, X } from "lucide-react";
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
import { Anthropic } from "../icons/anthropic";
import { Cohere } from "../icons/cohere";
import { OpenAI } from "../icons/openai";
import { MarkdownContent } from "../md-content";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TextArea } from "../ui/textarea";

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

                <VisuallyHidden>
                    <Dialog.Title>Ask AI</Dialog.Title>
                    <Dialog.Description>Ask AI any questions you have about our documentation.</Dialog.Description>
                </VisuallyHidden>

                <Dialog.Content className="fixed inset-0 flex flex-col items-stretch" asChild>
                    <ChatbotInterface initialInput={initialInput} api={api} headers={headers} components={components}>
                        <Dialog.Close asChild className="fixed top-2 right-2 z-10">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <X />
                            </Button>
                        </Dialog.Close>
                    </ChatbotInterface>
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

    useEffect(() => {
        focus();
    }, []);

    const [model, setModel] = useState("gpt-4o");

    const { messages, input, handleInputChange, handleSubmit } = useChat({
        initialInput,
        api,
        headers: { ...(_headers ?? {}), "X-Fern-Docs-Model": model },
    });

    return (
        <div
            ref={ref}
            {...props}
            onKeyDown={(e) => {
                if (e.altKey || e.metaKey || e.ctrlKey) {
                    return;
                }
                focus();
            }}
        >
            {messages.length > 0 && (
                <div className="overflow-scroll overscroll-contain flex-1">
                    {messages.map((m) => (
                        <article
                            key={m.id}
                            className="w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
                        >
                            <VisuallyHidden asChild>
                                {m.role === "user" ? <h5>You said:</h5> : <h6>AI said:</h6>}
                            </VisuallyHidden>
                            <div className="m-auto text-base py-[18px] px-3 w-full md:px-5 lg:px-4 xl:px-5">
                                <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                                    <div className="group/conversation-turn relative flex w-full min-w-0 flex-col">
                                        <div className="flex-col gap-1 md:gap-3">
                                            <div className="flex max-w-full flex-col grow">
                                                <div className="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words [.text-message+&]:mt-5">
                                                    {m.role === "user" ? (
                                                        <div className="flex w-full flex-col gap-1 empty:hidden items-end rtl:items-start">
                                                            <div className="relative max-w-[70%] rounded-3xl bg-[var(--olive-a3)] px-5 py-2.5 whitespace-pre-wrap">
                                                                <MarkdownContent components={components}>
                                                                    {m.content}
                                                                </MarkdownContent>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex w-full flex-col gap-1 empty:hidden first:pt-[3px]">
                                                            <div className="markdown prose w-full break-words dark:prose-invert">
                                                                <MarkdownContent components={components}>
                                                                    {m.content}
                                                                </MarkdownContent>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
            <div className="max-w-3xl w-screen m-auto shrink-0">
                <Composer value={input} onChange={handleInputChange} onSubmit={handleSubmit} autoFocus ref={inputRef}>
                    <ChatbotModelSelect value={model} onValueChange={setModel} />
                </Composer>
            </div>
            <div className="relative w-full p-2 text-center text-xs text-muted-foreground empty:hidden md:px-[60px]">
                <div className="h-2" />
            </div>
            {children}
        </div>
    );
});

ChatbotInterface.displayName = "ChatbotInterface";

const Composer = forwardRef<
    HTMLTextAreaElement,
    Omit<ComponentPropsWithoutRef<typeof TextArea>, "className"> & {
        onSubmit: (e: { preventDefault: () => void }) => void;
        asChild?: boolean;
    }
>(({ onSubmit, children, asChild, ...props }, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const Comp = asChild ? Slot : "div";

    return (
        <div
            className="flex w-full cursor-text flex-col rounded-3xl px-2.5 py-1 transition-colors contain-inline-size bg-[var(--olive-a3)]"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex min-h-[44px] items-center px-2">
                <TextArea
                    ref={composeRefs(ref, inputRef)}
                    placeholder="Ask AI anything about our documentation"
                    {...props}
                    className="w-full px-0 py-2 m-0 resize-none text-grayscale-12 placeholder:text-grayscale-a10 border-0 bg-transparent focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 max-h-52 placeholder:text-[var(--olive-a9)]"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            onSubmit(e);
                        }
                    }}
                />
            </div>
            <div className="flex h-[44px] items-center justify-between">
                <Comp>{children}</Comp>
                <button
                    className="p-1 rounded-full hover:bg-[var(--gray-a4)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    onClick={onSubmit}
                    disabled={!props.value}
                >
                    <ArrowUp />
                </button>
            </div>
        </div>
    );
});

Composer.displayName = "Composer";

const ChatbotModelSelect = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<"button"> & {
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string) => void;
        open?: boolean;
        defaultOpen?: boolean;
        onOpenChange?: (open: boolean) => void;
        disabled?: boolean;
        required?: boolean;
    }
>(({ value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, disabled, required, ...props }, ref) => {
    return (
        <Select
            name="model"
            defaultValue={defaultValue ?? "gpt-4o"}
            value={value}
            onValueChange={onValueChange}
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            disabled={disabled}
            required={required}
        >
            <SelectTrigger ref={ref} {...props} className={cn("rounded-full shadow-none", props.className)}>
                <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="gpt-4o">
                        <OpenAI /> GPT-4o
                    </SelectItem>
                    <SelectItem value="gpt-4o-mini">
                        <OpenAI /> GPT-4o Mini
                    </SelectItem>
                    <SelectItem value="command-r-plus">
                        <Cohere /> Cohere Command R+
                    </SelectItem>
                    <SelectItem value="command-r">
                        <Cohere /> Cohere Command R
                    </SelectItem>
                    <SelectItem value="claude-3-opus">
                        <Anthropic /> Claude 3 Opus
                    </SelectItem>
                    <SelectItem value="claude-3-5-sonnet">
                        <Anthropic /> Claude 3.5 Sonnet
                    </SelectItem>
                    <SelectItem value="claude-3-5-haiku">
                        <Anthropic /> Claude 3.5 Haiku
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
});

ChatbotModelSelect.displayName = "ChatbotModelSelect";
