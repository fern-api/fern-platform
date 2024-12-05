import {
    CommandActions,
    CommandEmpty,
    CommandGroupFilters,
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
import { HEADER_X_ALGOLIA_API_KEY } from "@fern-ui/fern-docs-utils";
import { useEventCallback } from "@fern-ui/react-commons";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { DOMAIN_ATOM, THEME_SWITCH_ENABLED_ATOM, atomWithStorageString, useFernUser, useSetTheme } from "../atoms";
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
    const userToken = useAlgoliaUserToken();
    const user = useFernUser();

    const [open, setOpen] = useCommandTrigger();
    const domain = useAtomValue(DOMAIN_ATOM);
    const isThemeSwitchEnabled = useAtomValue(THEME_SWITCH_ENABLED_ATOM);
    const setTheme = useSetTheme();
    const router = useRouter();

    const handleNavigate = useEventCallback((path: string) => {
        void router.push(path).then(() => {
            setOpen(false);
        });
    });

    const { data } = useApiRouteSWRImmutable("/api/fern-docs/search/v2/key", {
        request: { headers: { "X-User-Token": userToken } },
        validate: ApiKeySchema,
    });

    const facetApiEndpoint = useApiRoute("/api/fern-docs/search/v2/facet");

    const facetFetcher = useCallback(
        async (filters: readonly string[]) => {
            if (!data) {
                return {};
            }
            const searchParams = new URLSearchParams();
            filters.forEach((filter) => searchParams.append("filters", filter));
            const search = String(searchParams);
            const res = await fetch(`${facetApiEndpoint}${search ? `?${search}` : ""}`, {
                method: "GET",
                headers: { [HEADER_X_ALGOLIA_API_KEY]: data.apiKey },
            });
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
                    <CommandSearchHits onSelect={handleNavigate} prefetch={router.prefetch} />
                    <CommandActions>{isThemeSwitchEnabled && <CommandGroupTheme setTheme={setTheme} />}</CommandActions>
                </DesktopCommand>
            </DesktopSearchDialog>
        </SearchClientRoot>
    );
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
