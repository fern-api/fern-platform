import {
    AskAICommandItems,
    AskAIComposer,
    CommandActions,
    CommandAskAIGroup,
    CommandEmpty,
    CommandGroupFilters,
    CommandGroupPlayground,
    CommandGroupTheme,
    CommandSearchHits,
    DefaultDesktopBackButton,
    DesktopAskAIContent,
    DesktopCommand,
    DesktopCommandAboveInput,
    DesktopCommandBadges,
    DesktopCommandContent,
    DesktopCommandWithAskAI,
    DesktopSearchButton,
    DesktopSearchDialog,
    NewChatButton,
    SEARCH_INDEX,
    SearchClientRoot,
    Suggestions,
    SuggestionsSchema,
    useIsMobile,
} from "@fern-ui/fern-docs-search-ui";
import { useDebouncedCallback, useEventCallback } from "@fern-ui/react-commons";
import { Message, experimental_useObject, useChat } from "ai/react";
import { atom, useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/router";
import {
    ComponentPropsWithoutRef,
    Dispatch,
    ReactElement,
    ReactNode,
    SetStateAction,
    forwardRef,
    isValidElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { z } from "zod";

import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { debounce } from "es-toolkit/function";
import {
    CURRENT_VERSION_ATOM,
    DOMAIN_ATOM,
    HAS_API_PLAYGROUND,
    THEME_SWITCH_ENABLED_ATOM,
    atomWithStorageString,
    useFeatureFlags,
    useFernUser,
    useIsPlaygroundOpen,
    useSetTheme,
    useTogglePlayground,
} from "../atoms";
import { useApiRoute } from "../hooks/useApiRoute";
import { useApiRouteSWRImmutable } from "../hooks/useApiRouteSWR";
import { CodeBlock } from "../mdx/components/code/CodeBlock";

const ALGOLIA_USER_TOKEN_KEY = "algolia-user-token";

const ApiKeySchema = z.object({
    appId: z.string(),
    apiKey: z.string(),
});

function useAlgoliaUserToken() {
    const userTokenRef = useRef(
        atomWithStorageString(ALGOLIA_USER_TOKEN_KEY, `anonymous-user-${crypto.randomUUID()}`, { getOnInit: true }),
    );
    return useAtomValue(userTokenRef.current);
}

const askAiAtom = atom(false);

export function SearchV2(): ReactElement | false {
    const version = useAtomValue(CURRENT_VERSION_ATOM);
    const { isAskAiEnabled } = useFeatureFlags();

    const userToken = useAlgoliaUserToken();
    const user = useFernUser();

    const [open, setOpen] = useCommandTrigger();
    const domain = useAtomValue(DOMAIN_ATOM);

    const { data } = useApiRouteSWRImmutable("/api/fern-docs/search/v2/key", {
        request: { headers: { "X-User-Token": userToken } },
        validate: ApiKeySchema,
        // api key expires 24 hours, so we refresh it every 12 hours
        refreshInterval: 60 * 60 * 12 * 1000,
    });

    const router = useRouter();

    const handleNavigate = useEventCallback((path: string) => {
        void router.push(path).then(() => {
            setOpen(false);
        });
    });

    const facetApiEndpoint = useApiRoute("/api/fern-docs/search/v2/facet");
    const facetFetcher = useCallback(
        async (filters: readonly string[]) => {
            if (!data) {
                return {};
            }
            const searchParams = new URLSearchParams();
            searchParams.append("apiKey", data.apiKey);
            filters.forEach((filter) => searchParams.append("filters", filter));
            const search = String(searchParams);
            const res = await fetch(`${facetApiEndpoint}?${search}`, { method: "GET" });
            return res.json();
        },
        [data, facetApiEndpoint],
    );

    if (!data) {
        return <DesktopSearchButton variant="loading" />;
    }

    const { appId, apiKey } = data;

    const children = (
        <>
            <DesktopCommandAboveInput>
                <DesktopCommandBadges />
            </DesktopCommandAboveInput>
            <DefaultDesktopBackButton />
            <CommandGroupFilters />
            <CommandEmpty />
            <CommandSearchHits onSelect={handleNavigate} prefetch={router.prefetch} domain={domain} />
            <CommandActions>
                <CommandPlayground onClose={() => setOpen(false)} />
                <CommandTheme onClose={() => setOpen(false)} />
            </CommandActions>
        </>
    );

    return (
        <SearchClientRoot
            appId={appId}
            apiKey={apiKey}
            domain={domain}
            indexName={SEARCH_INDEX}
            fetchFacets={facetFetcher}
            authenticatedUserToken={user?.email}
            initialFilters={{ "version.title": version?.title }}
            analyticsTags={["search-v2-dialog"]}
        >
            <DesktopSearchDialog open={open} onOpenChange={setOpen} asChild trigger={<DesktopSearchButton />}>
                {isAskAiEnabled ? (
                    <DesktopCommandWithAskAIImpl onClose={() => setOpen(false)} apiKey={apiKey}>
                        {children}
                    </DesktopCommandWithAskAIImpl>
                ) : (
                    <DesktopCommand onClose={() => setOpen(false)}>
                        <DesktopCommandContent>{children}</DesktopCommandContent>
                    </DesktopCommand>
                )}
            </DesktopSearchDialog>
        </SearchClientRoot>
    );
}

const initialConversationAtom = atom<Message[]>([]);
const DesktopCommandWithAskAIImpl = forwardRef<
    HTMLDivElement,
    Omit<ComponentPropsWithoutRef<typeof DesktopCommandWithAskAI>, "isAskAI" | "children"> & {
        apiKey: string;
        children: ReactNode;
    }
>(({ children, apiKey, ...props }, ref) => {
    const domain = useAtomValue(DOMAIN_ATOM);
    const router = useRouter();

    const handleNavigate = useEventCallback((path: string) => {
        void router.push(path).then(() => {
            props.onClose?.();
        });
    });

    const [isAskAI, setIsAskAI] = useAtom(askAiAtom);
    const [id, setId] = useState(crypto.randomUUID());
    const [initialConversation, setInitialConversation] = useAtom(initialConversationAtom);
    const { messages, input, setInput, isLoading, append, stop, setMessages } = useChat({
        id,
        initialMessages: initialConversation,
        api: useApiRoute("/api/fern-docs/search/v2/chat"),
        onFinish: () => {
            setInitialConversation(messages);
        },
    });

    const { object, submit } = experimental_useObject({
        api: useApiRoute("/api/fern-docs/search/v2/suggest"),
        schema: SuggestionsSchema,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSubmit = useMemo(() => debounce(submit, 500, { edges: ["leading"] }), []);

    const suggested = useRef(false);

    useEffect(() => {
        if (apiKey && !suggested.current && isAskAI) {
            debouncedSubmit({ algoliaSearchKey: apiKey });
            suggested.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey, isAskAI]);

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

    return (
        <DesktopCommandWithAskAI {...props} ref={ref} isAskAI={isAskAI}>
            {isAskAI ? (
                <DesktopAskAIContent onReturnToSearch={() => setIsAskAI(false)} isThinking={isLoading}>
                    {messages.length > 0 && <NewChatButton onClick={handleClearMessages} />}

                    <AskAICommandItems
                        messages={messages}
                        onSelectHit={handleNavigate}
                        prefetch={router.prefetch}
                        components={{
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
                        }}
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
                        onPopState={() => setIsAskAI(false)}
                    />
                </DesktopAskAIContent>
            ) : (
                <DesktopCommandContent>
                    <CommandAskAIGroup
                        onAskAI={(initialInput) => {
                            setIsAskAI(true);
                            handleSubmitMessage(initialInput);
                        }}
                        forceMount
                    />
                    {children}
                </DesktopCommandContent>
            )}
        </DesktopCommandWithAskAI>
    );
});

DesktopCommandWithAskAIImpl.displayName = "DesktopCommandWithAskAIImpl";

function CommandPlayground({ onClose }: { onClose: () => void }) {
    const hasApiPlayground = useAtomValue(HAS_API_PLAYGROUND);
    const togglePlayground = useTogglePlayground();
    const playgroundOpen = useIsPlaygroundOpen();

    if (!hasApiPlayground) {
        return null;
    }
    return (
        <CommandGroupPlayground
            togglePlayground={() => {
                togglePlayground();
                onClose();
            }}
            playgroundOpen={playgroundOpen}
        />
    );
}

function CommandTheme({ onClose }: { onClose: () => void }) {
    const isThemeSwitchEnabled = useAtomValue(THEME_SWITCH_ENABLED_ATOM);
    const setTheme = useSetTheme();
    if (!isThemeSwitchEnabled) {
        return null;
    }
    return (
        <CommandGroupTheme
            setTheme={(theme) => {
                setTheme(theme);
                onClose();
            }}
        />
    );
}

function useCommandTrigger(): [boolean, Dispatch<SetStateAction<boolean>>] {
    const [open, setOpen] = useState(false);
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
    return [open, setOpen];
}
