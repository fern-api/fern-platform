"use client";

import { ChatbotDialog } from "@/components/chatbot/chatbot-dialog";
import { CHATBOT_MODELS, ChatbotModelProvider } from "@/components/chatbot/model-select";
import { CodeBlock } from "@/components/code-block";
import { AppSidebar, AppSidebarContent } from "@/components/demo/app-sidebar";
import { DesktopSearchDialog } from "@/components/demo/desktop-search-dialog";
import { DesktopInstantSearch } from "@/components/desktop/desktop-instant-search";
import { MobileInstantSearch } from "@/components/mobile/mobile-instant-search";
import { SearchClientProvider } from "@/components/shared/search-client-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { ReactElement, isValidElement, useEffect, useState } from "react";
import useSWR from "swr";
import { z } from "zod";

const USER_TOKEN_KEY = "user-token";

const ApiKeySchema = z.object({
    apiKey: z.string(),
});

export function DemoInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    const [open, setOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [initialInput, setInitialInput] = useState<string | undefined>(undefined);
    const { setTheme } = useTheme();
    const isMobile = useIsMobile();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isMobile) {
                return;
            }

            if (event.metaKey && (event.key === "k" || event.key === "/")) {
                setOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMobile]);

    const handleSubmit = (path: string) => {
        window.open(`https://${domain}${path}`, "_blank", "noopener,noreferrer");
    };

    const { data } = useSWR([domain, "api-key"], async (): Promise<{ apiKey: string; userToken: string }> => {
        const userToken = window.sessionStorage.getItem(USER_TOKEN_KEY) ?? `anonymous-user-${crypto.randomUUID()}`;
        window.sessionStorage.setItem(USER_TOKEN_KEY, userToken);
        const res = await fetch(`/api/search-key?domain=${domain}`, {
            headers: { "X-User-Token": userToken },
        });
        const { apiKey } = ApiKeySchema.parse(await res.json());
        return { apiKey, userToken };
    });

    if (!data) {
        return false;
    }

    const { apiKey, userToken } = data;

    const headers: Record<string, string> = {
        "X-Fern-Docs-Domain": domain,
        "X-Algolia-Search-Key": apiKey,
        "X-User-Token": userToken,
    };

    return (
        <SearchClientProvider appId={appId} apiKey={apiKey} domain={domain} indexName="fern-docs-search">
            {isMobile ? (
                <AppSidebar>
                    <MobileInstantSearch
                        onSelect={handleSubmit}
                        userToken={userToken}
                        setTheme={setTheme}
                        onAskAI={({ initialInput }) => {
                            setInitialInput(initialInput);
                            setIsChatOpen(true);
                            setOpen(false);
                        }}
                    >
                        <AppSidebarContent />
                    </MobileInstantSearch>
                </AppSidebar>
            ) : (
                <DesktopSearchDialog open={open} onOpenChange={setOpen}>
                    <DesktopInstantSearch
                        onSelect={handleSubmit}
                        userToken={userToken}
                        setTheme={setTheme}
                        onAskAI={({ initialInput }) => {
                            setInitialInput(initialInput);
                            setIsChatOpen(true);
                            setOpen(false);
                        }}
                        onClose={() => setOpen(false)}
                    />
                </DesktopSearchDialog>
            )}
            <ChatbotModelProvider
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
            </ChatbotModelProvider>
        </SearchClientProvider>
    );
}
