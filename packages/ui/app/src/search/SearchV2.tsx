import {
    CommandActions,
    CommandEmpty,
    CommandGroupFilters,
    CommandGroupPlayground,
    CommandGroupTheme,
    CommandSearchHits,
    DesktopBackButton,
    DesktopCommand,
    DesktopCommandAboveInput,
    DesktopCommandBadges,
    DesktopCommandBeforeInput,
    DesktopSearchButton,
    DesktopSearchDialog,
    SEARCH_INDEX,
    SearchClientRoot,
    useCommandUx,
    useFacetFilters,
    useIsMobile,
} from "@fern-ui/fern-docs-search-ui";
import { useEventCallback } from "@fern-ui/react-commons";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

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

export function SearchV2(): ReactElement | false {
    const version = useAtomValue(CURRENT_VERSION_ATOM);

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
                <DesktopCommand onClose={() => setOpen(false)}>
                    <DesktopCommandAboveInput>
                        <DesktopCommandBadges />
                    </DesktopCommandAboveInput>

                    <DesktopCommandBeforeInput>
                        <BackButton />
                    </DesktopCommandBeforeInput>

                    <CommandGroupFilters />
                    <CommandEmpty />
                    <RouterAwareCommandSearchHits onClose={() => setOpen(false)} />
                    <CommandActions>
                        <CommandPlayground onClose={() => setOpen(false)} />
                        <CommandTheme onClose={() => setOpen(false)} />
                    </CommandActions>
                </DesktopCommand>
            </DesktopSearchDialog>
        </SearchClientRoot>
    );
}

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

function RouterAwareCommandSearchHits({ onClose }: { onClose: () => void }) {
    const router = useRouter();

    const handleNavigate = useEventCallback((path: string) => {
        void router.push(path).then(() => {
            onClose();
        });
    });

    return <CommandSearchHits onSelect={handleNavigate} prefetch={router.prefetch} />;
}

function BackButton() {
    const { filters, popFilter, clearFilters } = useFacetFilters();
    const { focus } = useCommandUx();
    if (filters.length === 0) {
        return false;
    }

    return (
        <DesktopBackButton
            pop={() => {
                popFilter();
                focus();
            }}
            clear={() => {
                clearFilters();
                focus();
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
