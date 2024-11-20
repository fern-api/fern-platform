"use client";

import { DesktopInstantSearch } from "@/components/desktop/DesktopInstantSearch";
import { MobileInstantSearch } from "@/components/mobile/MobileInstantSearch";
import { SearchClientProvider } from "@/components/shared/SearchClientProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { ReactElement } from "react";
import useSWR from "swr";
import { z } from "zod";

const USER_TOKEN_KEY = "user-token";

const ApiKeySchema = z.object({
    apiKey: z.string(),
});

export function DesktopInstantSearchClient({ appId, domain }: { appId: string; domain: string }): ReactElement | false {
    // const [isChatOpen, setIsChatOpen] = useState(false);
    // const [initialInput, setInitialInput] = useState<string | undefined>(undefined);
    const { setTheme } = useTheme();

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

    return (
        <>
            <SearchClientProvider appId={appId} apiKey={apiKey} domain={domain} indexName="fern-docs-search">
                <Tabs defaultValue="desktop">
                    <TabsList>
                        <TabsTrigger value="desktop">Desktop</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="desktop">
                        <DesktopInstantSearch
                            onSelect={handleSubmit}
                            // onAskAI={({ initialInput }) => {
                            //     setInitialInput(initialInput);
                            //     setIsChatOpen(true);
                            // }}
                            userToken={userToken}
                            setTheme={setTheme}
                        />
                    </TabsContent>
                    <TabsContent value="mobile">
                        <div className="border border-border rounded-lg">
                            <MobileInstantSearch onSelect={handleSubmit} userToken={userToken} setTheme={setTheme}>
                                <div className="px-2 pb-2">
                                    <Alert>
                                        <AlertTitle>Mobile Menu</AlertTitle>
                                        <AlertDescription>
                                            The mobile search is intended to be rendered inside of the mobile menu, and
                                            will replace the menu contents once the search is focused.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </MobileInstantSearch>
                        </div>
                    </TabsContent>
                </Tabs>
            </SearchClientProvider>
            {/* <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent>
                    <Chat initialInput={initialInput} domain={domain} />
                </DialogContent>
            </Dialog> */}
        </>
    );
}
