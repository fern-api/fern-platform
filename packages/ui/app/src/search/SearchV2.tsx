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
    useCmdkShortcut,
    useSuggestions,
} from "@fern-ui/fern-docs-search-ui";
import { useDebouncedCallback, useEventCallback } from "@fern-ui/react-commons";
import { useChat } from "ai/react";
import { atom, useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { ComponentPropsWithoutRef, ReactElement, forwardRef, isValidElement, useCallback, useRef } from "react";
import { z } from "zod";

import { atomWithDefault } from "jotai/utils";
import {
    CURRENT_VERSION_ATOM,
    DOMAIN_ATOM,
    HAS_API_PLAYGROUND,
    THEME_SWITCH_ENABLED_ATOM,
    atomWithStorageString,
    useFernUser,
    useIsPlaygroundOpen,
    useSetTheme,
    useTogglePlayground,
} from "../atoms";
import { useApiRoute } from "../hooks/useApiRoute";
import { useApiRouteSWRImmutable } from "../hooks/useApiRouteSWR";
import { useRouteChangeComplete } from "../hooks/useRouteChanged";
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

const openAtom = atom(false);
const askAiAtom = atom(false);

export function SearchV2(): ReactElement | false {
    const version = useAtomValue(CURRENT_VERSION_ATOM);
    // const { isAskAiEnabled } = useFeatureFlags();
    const isAskAiEnabled = false;

    const userToken = useAlgoliaUserToken();
    const user = useFernUser();

    const [open, setOpen] = useAtom(openAtom);
    useCmdkShortcut(setOpen);

    const domain = useAtomValue(DOMAIN_ATOM);

    const { data } = useApiRouteSWRImmutable("/api/fern-docs/search/v2/key", {
        request: { headers: { "X-User-Token": userToken } },
        validate: ApiKeySchema,
        // api key expires 24 hours, so we refresh it every 12 hours
        refreshInterval: 60 * 60 * 12 * 1000,
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

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    useRouteChangeComplete(handleClose);

    if (!data) {
        return <DesktopSearchButton variant="loading" />;
    }

    const { appId, apiKey } = data;

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
                    <AskAICommand algoliaSearchKey={apiKey} onClose={handleClose} />
                ) : (
                    <SearchCommand onClose={handleClose} />
                )}
            </DesktopSearchDialog>
        </SearchClientRoot>
    );
}

const chatIdAtom = atomWithDefault<string>(() => crypto.randomUUID());
const suggestIdAtom = atomWithDefault<string>(() => crypto.randomUUID());

const AskAICommand = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof DesktopAskAIContent> & { algoliaSearchKey: string; onClose: () => void }
>(({ algoliaSearchKey, onClose, ...props }, ref) => {
    const domain = useAtomValue(DOMAIN_ATOM);
    const router = useRouter();

    const handleNavigate = useEventCallback((path: string) => {
        void router.push(path);
    });

    const [isAskAI, setIsAskAI] = useAtom(askAiAtom);
    const [chatId, setChatId] = useAtom(chatIdAtom);
    const [suggestId, _setSuggestId] = useAtom(suggestIdAtom);
    const { messages, input, setInput, isLoading, append, stop } = useChat({
        id: chatId,
        api: useApiRoute("/api/fern-docs/search/v2/chat"),
        body: { algoliaSearchKey },
    });

    const suggestions = useSuggestions({
        id: suggestId,
        api: useApiRoute("/api/fern-docs/search/v2/suggest"),
        body: { algoliaSearchKey },
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

    const handleClearMessages = useCallback(() => {
        stop();
        setChatId(crypto.randomUUID());
    }, [stop, setChatId]);

    return (
        <DesktopCommandWithAskAI {...props} ref={ref} onClose={onClose} isAskAI={isAskAI}>
            {isAskAI ? (
                <DesktopAskAIContent onReturnToSearch={() => setIsAskAI(false)} isThinking={isLoading}>
                    {messages.length > 0 && <NewChatButton onClick={handleClearMessages} />}

                    <AskAICommandItems
                        messages={messages}
                        onSelectHit={router.push}
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
                        <Suggestions suggestions={suggestions} onSubmitMessage={handleSubmitMessage} />
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
                    <DesktopCommandAboveInput>
                        <DesktopCommandBadges />
                    </DesktopCommandAboveInput>
                    <DefaultDesktopBackButton />
                    <CommandAskAIGroup
                        onAskAI={(initialInput) => {
                            setIsAskAI(true);
                            handleSubmitMessage(initialInput);
                        }}
                        forceMount
                    />
                    <CommandGroupFilters />
                    <CommandEmpty />
                    <CommandSearchHits onSelect={handleNavigate} prefetch={router.prefetch} domain={domain} />
                    <CommandActions>
                        <CommandPlayground onClose={onClose} />
                        <CommandTheme onClose={onClose} />
                    </CommandActions>
                </DesktopCommandContent>
            )}
        </DesktopCommandWithAskAI>
    );
});

AskAICommand.displayName = "AskAICommand";

const SearchCommand = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<typeof DesktopCommand> & {
        onClose: () => void;
    }
>(({ onClose, ...props }, ref) => {
    const domain = useAtomValue(DOMAIN_ATOM);
    const router = useRouter();

    return (
        <DesktopCommand {...props} ref={ref}>
            <DesktopCommandContent>
                <DesktopCommandAboveInput>
                    <DesktopCommandBadges />
                </DesktopCommandAboveInput>
                <DefaultDesktopBackButton />
                <CommandGroupFilters />
                <CommandEmpty />
                <CommandSearchHits onSelect={router.push} prefetch={router.prefetch} domain={domain} />
                <CommandActions>
                    <CommandPlayground onClose={onClose} />
                    <CommandTheme onClose={onClose} />
                </CommandActions>
            </DesktopCommandContent>
        </DesktopCommand>
    );
});

SearchCommand.displayName = "SearchCommand";

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

// function useCommandTrigger(): [boolean, Dispatch<SetStateAction<boolean>>] {
//     const [open, setOpen] = useState(false);
//     const isMobile = useIsMobile();

//     useEffect(() => {
//         const handleKeyDown = (event: KeyboardEvent) => {
//             if (isMobile) {
//                 return;
//             }

//             setOpen((prev) => {
//                 if (prev) {
//                     return prev;
//                 }

//                 if (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key === "k")) {
//                     event.preventDefault();
//                     return true;
//                 }

//                 return prev;
//             });
//         };
//         window.addEventListener("keydown", handleKeyDown);
//         return () => {
//             window.removeEventListener("keydown", handleKeyDown);
//         };
//     }, [isMobile]);
//     return [open, setOpen];
// }
