import { Badge } from "@fern-ui/components/badges";
import { Message } from "ai";
import { Command } from "cmdk";
import { useAtomValue } from "jotai";
import { Copy, Sparkles, User } from "lucide-react";
import { ReactElement } from "react";
import type { Components } from "react-markdown";
import { FootnoteSup, FootnotesSection } from "../chatbot/footnote";
import { ChatbotTurnContextProvider, useChatbotTurnContext } from "../chatbot/turn-context";
import { combineSearchResults, squeezeMessages } from "../chatbot/utils";
import { MarkdownContent } from "../md-content";
import { Button } from "../ui/button";
import { CopyToClipboard } from "../ui/copy-to-clipboard";
import { Suggestions } from "./suggestions";

interface AskAICommandItemsProps {
    messages: Message[];
    algoliaSearchKey: string | undefined;
    askAI: (message: string) => void;
    onSelectHit: (path: string) => void;
    components?: Components;
    isLoading?: boolean;
    refreshLastMessage?: () => void;
}

export const AskAICommandItems = ({
    messages,
    algoliaSearchKey,
    askAI,
    onSelectHit,
    components,
    isLoading,
    // refreshLastMessage,
}: AskAICommandItemsProps): ReactElement => {
    const squeezedMessages = squeezeMessages(messages);
    if (squeezedMessages.length === 0) {
        return (
            <>
                <div className="flex gap-4 p-2">
                    <Sparkles className="size-4 shrink-0 my-1" />
                    <div className="space-y-2">
                        <p>Hi, I&apos;m an AI assistant with access to documentation and other content.</p>
                    </div>
                </div>

                <Suggestions algoliaSearchKey={algoliaSearchKey} askAI={askAI} />
            </>
        );
    }

    return (
        <>
            {squeezedMessages.map((message, idx) => {
                const searchResults = combineSearchResults([message]);
                const Icon = message.role === "assistant" ? Sparkles : User;
                return (
                    <ChatbotTurnContextProvider key={message.id}>
                        <article id={`_${message.id}`}>
                            <div className="flex gap-4 px-2">
                                <Icon className="size-4 shrink-0 my-1" />
                                <section className="prose prose-sm dark:prose-invert">
                                    <MarkdownContent
                                        components={{
                                            ...components,
                                            sup: FootnoteSup,
                                            a: ({ children, node, ...props }) => (
                                                <a
                                                    {...props}
                                                    className="hover:text-[var(--accent-a10)] font-semibold decoration-[var(--accent-a10)] hover:decoration-2"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                            section: ({ children, node, ...props }) => {
                                                if (node?.properties["dataFootnotes"]) {
                                                    return (
                                                        <FootnotesSection
                                                            node={node}
                                                            searchResults={searchResults}
                                                            className="hidden"
                                                        />
                                                    );
                                                }

                                                return <section {...props}>{children}</section>;
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </MarkdownContent>
                                    {isLoading &&
                                        message.toolInvocations?.some(
                                            (invocation) => invocation.state !== "result",
                                        ) && <p className="text-[var(--grayscale-a10)]">Thinking...</p>}
                                </section>
                            </div>
                            {!isLoading && message.role === "assistant" && idx === squeezedMessages.length - 1 && (
                                <div className="flex gap-1 ml-auto px-2 w-fit">
                                    <CopyToClipboard content={message.content}>
                                        <Button variant="ghost" size="iconSm">
                                            <Copy />
                                        </Button>
                                    </CopyToClipboard>
                                    {/* <Button variant="ghost" size="iconSm" onClick={refreshLastMessage}>
                                        <RefreshCcw />
                                    </Button> */}
                                </div>
                            )}
                        </article>
                        <FootnoteCommands onSelect={onSelectHit} />
                    </ChatbotTurnContextProvider>
                );
            })}
        </>
    );
};

function FootnoteCommands({ onSelect }: { onSelect: (path: string) => void }) {
    const { footnotesAtom } = useChatbotTurnContext();
    const footnotes = useAtomValue(footnotesAtom);
    return (
        <>
            {footnotes.map((footnote, idx) => (
                <Command.Item key={footnote.ids.join("-")} onSelect={() => onSelect(footnote.url)}>
                    <Badge rounded>{String(idx + 1)}</Badge>
                    <span>{footnote.title}</span>
                </Command.Item>
            ))}
        </>
    );
}
