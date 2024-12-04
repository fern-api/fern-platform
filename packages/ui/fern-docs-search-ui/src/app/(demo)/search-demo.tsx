"use client";

import { AppSidebar, AppSidebarContent } from "@/app/(demo)/app-sidebar";
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
    DesktopSearchDialog,
    MobileCommand,
    SearchClientRoot,
    useCommandUx,
    useFacetFilters,
} from "@/components";
import { useIsMobile } from "@/hooks/use-mobile";
import { FacetsResponse } from "@/utils/facet-display";
import { useTheme } from "next-themes";
import { ReactElement, useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { z } from "zod";

const USER_TOKEN_KEY = "user-token";

const ApiKeySchema = z.object({
    apiKey: z.string(),
});

export function DemoInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
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

                if (event.key === "/" || (event.metaKey && event.key === "k")) {
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
            window.open(`https://${domain}${path}`, "_blank", "noopener,noreferrer");
        },
        [domain],
    );

    const { data } = useSWR([domain, "api-key"], async (): Promise<{ apiKey: string; userToken: string }> => {
        const userToken = window.sessionStorage.getItem(USER_TOKEN_KEY) ?? `anonymous-user-${crypto.randomUUID()}`;
        window.sessionStorage.setItem(USER_TOKEN_KEY, userToken);
        const res = await fetch(`/api/search-key?domain=${domain}`, {
            headers: { "X-User-Token": userToken },
        });
        const { apiKey } = ApiKeySchema.parse(await res.json());
        return { apiKey, userToken };
    });

    const facetFetcher = useCallback(
        async (filters: readonly string[]) => fetchFacets({ filters, domain, apiKey: data?.apiKey || "" }),
        [domain, data?.apiKey],
    );

    if (!data) {
        return false;
    }

    const { apiKey, userToken } = data;

    return (
        <SearchClientRoot
            appId={appId}
            apiKey={apiKey}
            domain={domain}
            indexName="fern-docs-search"
            fetchFacets={facetFetcher}
            userToken={userToken}
        >
            {isMobile ? (
                <AppSidebar>
                    <MobileCommand open={open} onOpenChange={setOpen}>
                        {open ? (
                            <>
                                <CommandGroupFilters />
                                <CommandEmpty />
                                <CommandSearchHits onSelect={handleSubmit} />
                            </>
                        ) : (
                            <AppSidebarContent />
                        )}
                    </MobileCommand>
                </AppSidebar>
            ) : (
                <DesktopSearchDialog open={open} onOpenChange={setOpen} asChild>
                    <DesktopCommand onClose={() => setOpen(false)}>
                        <DesktopCommandAboveInput>
                            <DesktopCommandBadges />
                        </DesktopCommandAboveInput>

                        <DesktopCommandBeforeInput>
                            <BackButton />
                        </DesktopCommandBeforeInput>

                        <CommandGroupFilters />
                        <CommandEmpty />
                        <CommandSearchHits onSelect={handleSubmit} />
                        <CommandActions>
                            <CommandGroupTheme setTheme={setTheme} />
                        </CommandActions>
                    </DesktopCommand>
                </DesktopSearchDialog>
            )}
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
