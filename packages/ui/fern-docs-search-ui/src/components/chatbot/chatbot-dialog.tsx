import { isNonNullish } from "@fern-api/ui-core-utils";
import { Badge } from "@fern-ui/fern-docs-badges";
import { composeRefs } from "@radix-ui/react-compose-refs";
import * as Dialog from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Message, useChat } from "ai/react";
import type { Element as HastElement } from "hast";
import { PrimitiveAtom, atom, useAtom, useAtomValue } from "jotai";
import { ArrowUp, X } from "lucide-react";
import {
    ComponentPropsWithoutRef,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    createContext,
    forwardRef,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { type Components } from "react-markdown";
import { EXIT, visit } from "unist-util-visit";
import { z } from "zod";
import { Anthropic } from "../icons/anthropic";
import { Cohere } from "../icons/cohere";
import { OpenAI } from "../icons/openai";
import { PageIcon } from "../icons/page";
import { MarkdownContent } from "../md-content";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TextArea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

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

interface Footnote {
    id: string;
    url: string;
    title?: string;
    icon?: string;
    type?: string;
    api_type?: string;
}

const ChatbotTurnContext = createContext<PrimitiveAtom<Footnote[]>>(atom<Footnote[]>([]));

function ChatbotTurnContextProvider({ children }: { children: ReactNode }): ReactElement {
    const footnotes = useRef(atom<Footnote[]>([]));

    return <ChatbotTurnContext.Provider value={footnotes.current}>{children}</ChatbotTurnContext.Provider>;
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

    const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
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
            {squeezedMessages.length > 0 && (
                <div className="overflow-scroll overscroll-contain flex-1">
                    {squeezedMessages.map((m) => (
                        <ChatbotTurn key={m.id} role={m.role}>
                            <ChatbotTurnContextProvider>
                                <MarkdownContent
                                    components={{
                                        ...components,
                                        sup: FootnoteSup,
                                        a: ({ children, node, ...props }) => {
                                            return (
                                                <a
                                                    {...props}
                                                    className="hover:text-[var(--accent-a10)] font-semibold decoration-[var(--accent-a10)] hover:decoration-2"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {children}
                                                </a>
                                            );
                                        },
                                        section: ({ children, node, ...props }) => {
                                            if (node?.properties["dataFootnotes"]) {
                                                return <FootnotesSection node={node} searchResults={searchResults} />;
                                            }

                                            return <section {...props}>{children}</section>;
                                        },
                                    }}
                                >
                                    {m.content}
                                </MarkdownContent>
                            </ChatbotTurnContextProvider>
                        </ChatbotTurn>
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

function FootnoteSup({ node }: { node?: HastElement }): ReactElement | null {
    const footnotes = useAtomValue(useContext(ChatbotTurnContext));

    if (node == null) {
        return null;
    }

    const id = selectFootnoteId(node);

    if (!id) {
        return null;
    }

    const fn = footnotes.find((f) => f.id === id);

    if (!fn) {
        return null;
    }

    const index = footnotes.findIndex((f) => f.id === id);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Badge rounded interactive asChild className="not-prose" disabled={!fn} size="sm">
                        <a href={fn?.url} target="_blank" rel="noreferrer" className="ms-1">
                            <span className="text-xs text-[var(--grayscale-a9)]">{String(index + 1)}</span>
                        </a>
                    </Badge>
                </TooltipTrigger>

                <TooltipContent className="not-prose">
                    <h5 className="font-semibold text-[var(--grayscale-12)] flex items-center gap-2">
                        <PageIcon
                            icon={fn.icon}
                            type={fn.api_type ?? fn.type}
                            isSubPage={fn.url.includes("#")}
                            className="size-4"
                        />
                        <a href={fn.url} target="_blank" rel="noreferrer">
                            {fn.title}
                        </a>
                    </h5>
                    <p className="max-w-xs break-words text-[var(--grayscale-a9)] leading-snug text-xs">
                        <a
                            href={fn.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[var(--grayscale-a10)] hover:underline"
                        >
                            {fn.url}
                        </a>
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function selectFootnoteLinks(node: HastElement): { id: string; href: string }[] {
    return (
        node.children
            .find((child): child is HastElement => child.type === "element" && child.tagName === "ol")
            ?.children.filter((child): child is HastElement => child.type === "element" && child.tagName === "li")
            .map((child) => {
                const id = child.properties.id;

                if (typeof id !== "string") {
                    return null;
                }

                const href = selectHref(child);

                if (!href) {
                    return null;
                }

                return { href, id };
            })
            .filter(isNonNullish) ?? []
    );
}

function FootnotesSection({
    node,
    searchResults,
}: {
    node: HastElement;
    searchResults: SearchResult[];
}): ReactElement | null {
    const [footnotes, setFootnotes] = useAtom(useContext(ChatbotTurnContext));

    useEffect(() => {
        setFootnotes(
            selectFootnoteLinks(node).map(({ id, href }) => ({
                id,
                url: href,
                title: searchResults.find((result) => result.url === href)?.title,
                icon: searchResults.find((result) => result.url === href)?.icon,
                type: searchResults.find((result) => result.url === href)?.type,
                api_type: searchResults.find((result) => result.url === href)?.api_type,
            })),
        );
    }, [node, searchResults, setFootnotes]);

    if (footnotes.length === 0) {
        return null;
    }

    return (
        <section data-footnotes className="not-prose">
            <VisuallyHidden asChild>
                <h6>Footnotes</h6>
            </VisuallyHidden>
            <div className="flex gap-1 flex-wrap">
                {footnotes.map(({ id, url, title, icon, type, api_type }, index) => {
                    return (
                        <Badge key={id} asChild interactive rounded>
                            <a href={url} target="_blank" rel="noreferrer">
                                <PageIcon icon={icon} type={api_type ?? type} isSubPage={url.includes("#")} />
                                {title}
                                <span className="text-xs text-[var(--grayscale-a9)]">{String(index + 1)}</span>
                            </a>
                        </Badge>
                    );
                })}
            </div>
        </section>
    );
}

const SearchResult = z.object({
    title: z.string(),
    url: z.string(),
    icon: z.string().optional(),
    type: z.string(),
    api_type: z.string().optional(),
});

type SearchResult = z.infer<typeof SearchResult>;

function squeezeMessages(
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

function combineSearchResults(messages: Message[]): SearchResult[] {
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

function selectHref(node: HastElement): undefined | string {
    let href: undefined | string;
    visit(node, "element", (innerNode) => {
        if (innerNode.tagName === "a" && typeof innerNode.properties.href === "string") {
            href = innerNode.properties.href;
            return EXIT;
        }
    });

    return href;
}

function selectFootnoteId(node: HastElement): string | undefined {
    if (node.type !== "element" || node.tagName !== "sup") {
        return undefined;
    }

    const child = node.children[0];

    if (!child || child.type !== "element" || child.tagName !== "a") {
        return undefined;
    }

    const id = child.properties.id;

    if (typeof id !== "string") {
        return undefined;
    }

    return id.replace("fnref", "fn");
}

ChatbotInterface.displayName = "ChatbotInterface";

const ChatbotTurn = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div"> & { role: "user" | "assistant" }>(
    ({ children, role, ...props }, ref) => {
        return (
            <article
                ref={ref}
                {...props}
                className={cn(
                    "w-full scroll-mb-[var(--thread-trailing-height,150px)] text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]",
                    props.className,
                )}
            >
                <VisuallyHidden asChild>{role === "user" ? <h5>You said:</h5> : <h5>AI said:</h5>}</VisuallyHidden>
                <div className="m-auto text-base py-[18px] px-3 w-full md:px-5 lg:px-4 xl:px-5">
                    <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                        <div className="group/conversation-turn relative flex w-full min-w-0 flex-col">
                            <div className="flex-col gap-1 md:gap-3">
                                <div className="flex max-w-full flex-col grow">
                                    <div className="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words [.text-message+&]:mt-5">
                                        <div
                                            className={cn("flex w-full flex-col gap-1 empty:hidden", {
                                                "items-end rtl:items-start": role === "user",
                                                "first:pt-[3px]": role === "assistant",
                                            })}
                                        >
                                            <div
                                                className={
                                                    role === "user"
                                                        ? "relative max-w-[70%] rounded-3xl bg-[var(--grayscale-a3)] px-5 py-2.5 whitespace-pre-wrap"
                                                        : "markdown prose w-full break-words dark:prose-invert"
                                                }
                                            >
                                                {children}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    },
);

ChatbotTurn.displayName = "ChatbotTurn";

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
            className="flex w-full cursor-text flex-col rounded-3xl px-2.5 py-1 transition-colors contain-inline-size bg-[var(--grayscale-a3)]"
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex min-h-[44px] items-center px-2">
                <TextArea
                    ref={composeRefs(ref, inputRef)}
                    placeholder="Ask AI anything about our documentation"
                    {...props}
                    className="w-full px-0 py-2 m-0 resize-none text-grayscale-12 placeholder:text-grayscale-a10 border-0 bg-transparent focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 max-h-52 placeholder:text-[var(--grayscale-a9)]"
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
