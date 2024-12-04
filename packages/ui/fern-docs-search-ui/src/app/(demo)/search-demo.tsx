"use client";

import { AppSidebar, AppSidebarContent } from "@/components/demo/app-sidebar";
import { DesktopSearchDialog } from "@/components/demo/desktop-search-dialog";
import { DesktopCommand } from "@/components/desktop/desktop-command";
import { MobileCommand } from "@/components/mobile/mobile-command";
import { CommandActions } from "@/components/shared/command-actions";
import { CommandEmpty } from "@/components/shared/command-empty";
import { CommandGroupFilters } from "@/components/shared/command-filters";
import { CommandSearchHits } from "@/components/shared/command-hits";
import { CommandGroupTheme } from "@/components/shared/command-theme";
import { SearchClientRoot } from "@/components/shared/search-client";
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

    // const headers: Record<string, string> = {
    //     "X-Algolia-Search-Key": apiKey,
    //     "X-User-Token": userToken,
    // };

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
                    <DesktopCommand
                        onClose={() => setOpen(false)}
                        // components={{
                        //     pre(props) {
                        //         if (isValidElement(props.children) && props.children.type === "code") {
                        //             const { children, className } = props.children.props as {
                        //                 children: string;
                        //                 className: string;
                        //             };
                        //             if (typeof children === "string") {
                        //                 const match = /language-(\w+)/.exec(className || "")?.[1] ?? "plaintext";
                        //                 return <CodeBlock code={children} language={match} />;
                        //             }
                        //         }
                        //         return <pre {...props} />;
                        //     },
                        // }}
                        // systemContext={{ domain }}
                    >
                        <CommandGroupFilters />
                        <CommandEmpty />
                        <CommandSearchHits onSelect={handleSubmit} />
                        <CommandActions>
                            <CommandGroupTheme setTheme={setTheme} />
                        </CommandActions>
                    </DesktopCommand>
                </DesktopSearchDialog>
            )}
            {/* <ChatbotModelProvider
                models={
                    domain.includes("cohere")
                        ? [
                              ...CHATBOT_MODELS.filter((m) => m.provider === "cohere"),
                              ...CHATBOT_MODELS.filter((m) => m.provider !== "cohere"),
                          ]
                        : CHATBOT_MODELS
                }
            >
                <ChatbotDialog
                    open={isChatOpen}
                    onOpenChange={setIsChatOpen}
                    headers={headers}
                    systemContext={{ domain }}
                    initialInput={initialInput}
                    components={{
                        pre(props) {
                            if (isValidElement(props.children) && props.children.type === "code") {
                                const { children, className } = props.children.props as {
                                    children: string;
                                    className: string;
                                };
                                if (typeof children === "string") {
                                    const match = /language-(\w+)/.exec(className || "")?.[1] ?? "plaintext";
                                    return <CodeBlock code={children} language={match} />;
                                }
                            }
                            return <pre {...props} />;
                        },
                    }}
                />
            </ChatbotModelProvider> */}
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
