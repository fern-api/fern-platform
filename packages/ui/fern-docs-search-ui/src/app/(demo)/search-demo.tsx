"use client";

import { useTheme } from "next-themes";
import { ReactElement, isValidElement, useCallback, useState } from "react";
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
import { useCmdkShortcut } from "@/hooks/use-cmdk-shortcut";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSuggestions } from "@/hooks/use-suggestions";
import { FacetsResponse, SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import { useDebouncedCallback } from "@fern-ui/react-commons";
import { useChat } from "ai/react";
import { useAtom } from "jotai";
import { atomWithDefault, atomWithStorage } from "jotai/utils";
import useSWRImmutable from "swr/immutable";

const USER_TOKEN_KEY = "user-token";

const ApiKeySchema = z.object({
    apiKey: z.string(),
});

const modelAtom = atomWithStorage("ai-model", "claude-3-5-haiku", undefined, {
    getOnInit: true,
});

const chatIdAtom = atomWithDefault<string>(() => crypto.randomUUID());
const suggestIdAtom = atomWithDefault<string>(() => crypto.randomUUID());

export function DemoInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    const [askAi, setAskAi] = useState(false);
    const [open, setOpen] = useState(false);
    const { setTheme } = useTheme();
    const isMobile = useIsMobile();

    useCmdkShortcut(setOpen);

    const handleSubmit = useCallback(
        (path: string) => window.open(String(new URL(path, `https://${domain}`)), "_blank", "noopener,noreferrer"),
        [domain],
    );

    const { data: algoliaSearchKey } = useSWRImmutable([domain, "api-key"], async (): Promise<string> => {
        const userToken = window.sessionStorage.getItem(USER_TOKEN_KEY) ?? `anonymous-user-${crypto.randomUUID()}`;
        window.sessionStorage.setItem(USER_TOKEN_KEY, userToken);
        const res = await fetch(`/api/search-key?domain=${domain}`, {
            headers: { "X-User-Token": userToken },
        });
        const { apiKey } = ApiKeySchema.parse(await res.json());
        return apiKey;
    });

    const facetFetcher = useCallback(
        async (filters: readonly string[]) => fetchFacets({ filters, domain, apiKey: algoliaSearchKey || "" }),
        [algoliaSearchKey, domain],
    );

    const [model, setModel] = useAtom(modelAtom);
    const [chatId, setChatId] = useAtom(chatIdAtom);
    const [suggestId, _setSuggestId] = useAtom(suggestIdAtom);

    const { messages, isLoading, append, stop, input, setInput } = useChat({
        id: chatId,
        api: "/api/chat",
        body: { algoliaSearchKey, domain, model },
    });

    const suggestions = useSuggestions({
        id: suggestId,
        api: "/api/suggest",
        body: { algoliaSearchKey, domain, model },
        shouldSuggest: algoliaSearchKey != null && askAi,
    });

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

    if (!algoliaSearchKey) {
        return false;
    }

    return (
        <SearchClientRoot
            appId={appId}
            apiKey={algoliaSearchKey}
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
                    <DesktopCommandWithAskAI isAskAI={askAi} onClose={() => setOpen(false)}>
                        {askAi ? (
                            <DesktopAskAIContent onReturnToSearch={() => setAskAi(false)} isThinking={isLoading}>
                                {messages.length > 0 && (
                                    <NewChatButton
                                        onClick={() => {
                                            stop();
                                            setChatId(crypto.randomUUID());
                                        }}
                                    />
                                )}

                                <AskAICommandItems
                                    messages={messages}
                                    onSelectHit={handleSubmit}
                                    components={{
                                        pre(props) {
                                            if (isValidElement(props.children) && props.children.type === "code") {
                                                const { children, className } = props.children.props as {
                                                    children: string;
                                                    className: string;
                                                };
                                                if (typeof children === "string") {
                                                    const match =
                                                        /language-(\w+)/.exec(className || "")?.[1] ?? "plaintext";
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
                                    }}
                                    isThinking={isLoading}
                                    domain={domain}
                                >
                                    <Suggestions suggestions={suggestions} onSubmitMessage={handleSubmitMessage} />
                                </AskAICommandItems>

                                <AskAIComposer
                                    isLoading={isLoading}
                                    stop={stop}
                                    onSend={handleSubmitMessage}
                                    onPopState={() => setAskAi(false)}
                                    value={input}
                                    onValueChange={setInput}
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
