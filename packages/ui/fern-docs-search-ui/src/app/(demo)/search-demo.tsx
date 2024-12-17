"use client";

import { useTheme } from "next-themes";
import { ReactElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { z } from "zod";

import { AppSidebar, AppSidebarContent } from "@/app/(demo)/app-sidebar";
import {
    CommandActions,
    CommandEmpty,
    CommandGroupFilters,
    CommandGroupTheme,
    CommandSearchHits,
    DefaultDesktopBackButton,
    DesktopCommandContent,
    DesktopSearchDialog,
    MobileCommand,
    SearchClientRoot,
} from "@/components";
import { ChatbotModelSelect } from "@/components/chatbot/model-select";
import { CodeBlock } from "@/components/code-block";
import {
    AskAICommandItems,
    AskAIComposer,
    DesktopAskAIComposerActions,
    DesktopAskAIContent,
    DesktopCommandWithAskAI,
    NewChatButton,
} from "@/components/desktop/desktop-ask-ai";
import { Suggestions } from "@/components/desktop/suggestions";
import { CommandAskAIGroup } from "@/components/shared/command-ask-ai";
import { useIsMobile } from "@/hooks/use-mobile";
import { SuggestionsSchema } from "@/server/suggestions-schema";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { FacetsResponse, SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import { useDebouncedCallback } from "@fern-ui/react-commons";
import { Message } from "ai";
import { experimental_useObject, useChat } from "ai/react";
import { debounce } from "es-toolkit/function";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Components } from "react-markdown";

const USER_TOKEN_KEY = "user-token";

const ApiKeySchema = z.object({
    apiKey: z.string(),
});

const modelAtom = atomWithStorage("ai-model", "claude-3-5-haiku", undefined, {
    getOnInit: true,
});

const initialConversationAtom = atom<Message[]>([]);

export function DemoInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    const [askAi, setAskAi] = useState(false);
    const [open, setOpen] = useState(false);
    const { setTheme } = useTheme();
    const isMobile = useIsMobile();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isMobile) {
                return;
            }

            setOpen((prev) => {
                if (prev) {
                    return prev;
                }

                if (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key === "k")) {
                    event.preventDefault();
                    return true;
                }

                return prev;
            });
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMobile]);

    const handleSubmit = useCallback(
        (path: string) => {
            window.open(String(new URL(path, `https://${domain}`)), "_blank", "noopener,noreferrer");
        },
        [domain],
    );

    const { data: apiKey } = useSWR([domain, "api-key"], async (): Promise<string> => {
        const userToken = window.sessionStorage.getItem(USER_TOKEN_KEY) ?? `anonymous-user-${crypto.randomUUID()}`;
        window.sessionStorage.setItem(USER_TOKEN_KEY, userToken);
        const res = await fetch(`/api/search-key?domain=${domain}`, {
            headers: { "X-User-Token": userToken },
        });
        const { apiKey } = ApiKeySchema.parse(await res.json());
        return apiKey;
    });

    const facetFetcher = useCallback(
        async (filters: readonly string[]) => fetchFacets({ filters, domain, apiKey: apiKey || "" }),
        [domain, apiKey],
    );

    const [model, setModel] = useAtom(modelAtom);

    const [initialConversation, setInitialConversation] = useAtom(initialConversationAtom);

    const [id, setId] = useState(crypto.randomUUID());
    const { messages, input, setInput, isLoading, append, stop, setMessages } = useChat({
        id,
        initialMessages: initialConversation,
        api: "/api/chat",
        body: {
            algoliaSearchKey: apiKey,
            domain,
            model,
        },
        onFinish: () => {
            setInitialConversation(messages);
        },
    });

    const { object, submit } = experimental_useObject({
        api: "/api/suggest",
        schema: SuggestionsSchema,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSubmit = useMemo(() => debounce(submit, 500, { edges: ["leading"] }), []);

    const suggested = useRef(false);

    useEffect(() => {
        if (apiKey && !suggested.current) {
            debouncedSubmit({
                algoliaSearchKey: apiKey,
                domain,
                model,
            });
            suggested.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain, apiKey, model]);

    const handleSubmitMessage = useDebouncedCallback(
        (message: string) => {
            if (message.trim().split(/\s+/).length < 2) {
                setInput(message);
                return;
            }
            void append({ role: "user", content: message });
            setInput("");
        },
        [append, setInput],
        1000,
        { edges: ["leading"] },
    );

    const handleClearMessages = useCallback(() => {
        stop();
        setMessages([]);
        setId(crypto.randomUUID());
    }, [stop, setMessages, setId]);

    const handleCloseDialog = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const components = useMemo<Components>(
        () => ({
            pre(props) {
                if (isValidElement(props.children) && props.children.type === "code") {
                    const { children, className } = props.children.props as {
                        children: string;
                        className: string;
                    };
                    if (typeof children === "string") {
                        const match = /language-(\w+)/.exec(className || "")?.[1] ?? "plaintext";
                        return <CodeBlock code={children} language={match} fontSize="sm" />;
                    }
                }
                return <pre {...props} />;
            },

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
        }),
        [],
    );

    if (!apiKey) {
        return false;
    }

    return (
        <SearchClientRoot
            appId={appId}
            apiKey={apiKey}
            domain={domain}
            indexName={SEARCH_INDEX}
            fetchFacets={facetFetcher}
        >
            {isMobile ? (
                <AppSidebar>
                    <MobileCommand open={open} onOpenChange={setOpen}>
                        {open ? (
                            <>
                                <CommandGroupFilters />
                                <CommandEmpty />
                                <CommandSearchHits onSelect={handleSubmit} domain={domain} />
                            </>
                        ) : (
                            <AppSidebarContent />
                        )}
                    </MobileCommand>
                </AppSidebar>
            ) : (
                <DesktopSearchDialog open={open} onOpenChange={setOpen} asChild>
                    <DesktopCommandWithAskAI isAskAI={askAi} onClose={handleCloseDialog}>
                        {askAi ? (
                            <DesktopAskAIContent onReturnToSearch={() => setAskAi(false)} isThinking={isLoading}>
                                {messages.length > 0 && <NewChatButton onClick={handleClearMessages} />}

                                <AskAICommandItems
                                    messages={messages}
                                    onSelectHit={handleSubmit}
                                    components={components}
                                    isThinking={isLoading}
                                    domain={domain}
                                >
                                    <Suggestions
                                        suggestions={object?.suggestions ?? EMPTY_ARRAY}
                                        onSubmitMessage={handleSubmitMessage}
                                    />
                                </AskAICommandItems>

                                <AskAIComposer
                                    value={input}
                                    onValueChange={setInput}
                                    isLoading={isLoading}
                                    stop={stop}
                                    onSend={handleSubmitMessage}
                                    onPopState={() => setAskAi(false)}
                                />

                                <DesktopAskAIComposerActions>
                                    <ChatbotModelSelect value={model} onValueChange={setModel} />
                                </DesktopAskAIComposerActions>
                            </DesktopAskAIContent>
                        ) : (
                            <DesktopCommandContent>
                                <DefaultDesktopBackButton />

                                <CommandAskAIGroup
                                    onAskAI={(initialInput) => {
                                        handleSubmitMessage(initialInput);
                                        setAskAi(true);
                                    }}
                                    forceMount
                                />

                                <CommandGroupFilters />
                                <CommandEmpty />
                                <CommandSearchHits onSelect={handleSubmit} domain={domain} />
                                <CommandActions>
                                    <CommandGroupTheme setTheme={setTheme} />
                                </CommandActions>
                            </DesktopCommandContent>
                        )}
                    </DesktopCommandWithAskAI>
                </DesktopSearchDialog>
            )}
        </SearchClientRoot>
    );
}

async function fetchFacets({
    filters,
    domain,
    apiKey,
}: {
    filters: readonly string[];
    domain: string;
    apiKey: string;
}): Promise<FacetsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("domain", domain);
    filters.forEach((filter) => searchParams.append("filters", filter));
    searchParams.set("x-algolia-api-key", apiKey);
    const search = String(searchParams);

    const res = await fetch(`/api/facet-values?${search}`);
    return res.json();
}
