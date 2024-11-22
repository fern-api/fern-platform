import { ArrowDown } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Components } from "react-markdown";
import { MarkdownContent } from "../md-content";
import { Button } from "../ui/button";
import { FootnoteSup, FootnotesSection } from "./footnote";
import { ChatbotTurn } from "./turn";
import { ChatbotTurnContextProvider } from "./turn-context";
import { SearchResult } from "./utils";

export function ChatbotConversation({
    isLoading,
    messages,
    components,
    searchResults,
}: {
    isLoading: boolean;
    messages: {
        id: string;
        createdAt?: Date | undefined;
        role: "assistant" | "user";
        content: string;
        isThinking?: boolean;
    }[];
    components: Components | undefined;
    searchResults: SearchResult[];
}): ReactNode {
    const ref = useRef<HTMLDivElement>(null);
    const sizerRef = useRef<HTMLDivElement>(null);

    const userScrolled = useRef(false);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

    useEffect(() => {
        if (!sizerRef.current) {
            return;
        }

        const observer = new ResizeObserver(() => {
            if (!ref.current) {
                return;
            }

            setIsScrolledToBottom(ref.current.scrollTop + ref.current.clientHeight >= ref.current.scrollHeight);
        });

        observer.observe(sizerRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isLoading) {
            userScrolled.current = false;
        }
    }, [isLoading]);

    useEffect(() => {
        if (userScrolled.current) {
            return;
        }

        const id = messages.findLast((m) => m.role === "user")?.id;
        if (id) {
            const el = ref.current?.querySelector(`#_${id}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages]);

    if (messages.length === 0) {
        return false;
    }

    return (
        <div
            ref={ref}
            className="overflow-scroll overscroll-contain flex-1 relative"
            onWheelCapture={() => {
                userScrolled.current = true;
            }}
            onTouchStartCapture={() => {
                userScrolled.current = true;
            }}
            onScroll={(e) => {
                setIsScrolledToBottom(
                    e.currentTarget.scrollTop + e.currentTarget.clientHeight >= e.currentTarget.scrollHeight - 10,
                );
            }}
        >
            <div ref={sizerRef} className="pt-6 max-md:pt-12">
                {messages.map((m) => (
                    <ChatbotTurn key={m.id} role={m.role} id={`_${m.id}`}>
                        <ChatbotTurnContextProvider>
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
                                            return <FootnotesSection node={node} searchResults={searchResults} />;
                                        }

                                        return <section {...props}>{children}</section>;
                                    },
                                }}
                            >
                                {m.content}
                            </MarkdownContent>
                            {m.isThinking && <p className="text-[var(--grayscale-a10)]">Thinking...</p>}
                        </ChatbotTurnContextProvider>
                    </ChatbotTurn>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <ChatbotTurn role="assistant" id="thinking">
                        <p className="text-[var(--grayscale-a10)]">Thinking...</p>
                    </ChatbotTurn>
                )}

                <div className="h-10" />

                <div className="sticky bottom-0 inset-x-0">
                    {!isScrolledToBottom && (
                        <Button
                            variant="outline"
                            className="rounded-full absolute left-1/2 -translate-x-1/2 bottom-4 shadow-xl"
                            size="icon"
                            onClick={() => ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" })}
                        >
                            <ArrowDown />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
