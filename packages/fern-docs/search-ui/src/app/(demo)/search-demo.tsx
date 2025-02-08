"use client";

import { useTheme } from "next-themes";
import { ReactElement, useCallback, useEffect, useState } from "react";
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
  DesktopSearchButton,
  DesktopSearchDialog,
  MobileCommand,
  SearchClientRoot,
} from "@/components";
import { ChatbotModelSelect } from "@/components/chatbot/model-select";
import { DesktopCommandWithAskAI } from "@/components/desktop/desktop-ask-ai";
import { DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { FacetsResponse, SEARCH_INDEX } from "@fern-docs/search-server/algolia";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const USER_TOKEN_KEY = "user-token";

const ApiKeySchema = z.object({
  apiKey: z.string(),
});

const modelAtom = atomWithStorage("ai-model", "claude-3-5-haiku", undefined, {
  getOnInit: true,
});

export function DemoInstantSearchClient({
  appId,
  domain,
}: {
  appId: string;
  domain: string;
}): ReactElement | false {
  const [initialInput, setInitialInput] = useState("");
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

        if (
          event.key === "/" ||
          ((event.metaKey || event.ctrlKey) && event.key === "k")
        ) {
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
      window.open(
        String(new URL(path, `https://${domain}`)),
        "_blank",
        "noopener,noreferrer"
      );
    },
    [domain]
  );

  const { data: apiKey } = useSWR(
    [domain, "api-key"],
    async (): Promise<string> => {
      const userToken =
        window.sessionStorage.getItem(USER_TOKEN_KEY) ??
        `anonymous-user-${crypto.randomUUID()}`;
      window.sessionStorage.setItem(USER_TOKEN_KEY, userToken);
      const res = await fetch(`/api/search-key?domain=${domain}`, {
        headers: { "X-User-Token": userToken },
      });
      const { apiKey } = ApiKeySchema.parse(await res.json());
      return apiKey;
    }
  );

  const facetFetcher = useCallback(
    async (filters: readonly string[]) =>
      fetchFacets({ filters, domain, apiKey: apiKey || "" }),
    [domain, apiKey]
  );

  const [model, setModel] = useAtom(modelAtom);

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
        <DesktopSearchDialog
          open={open}
          onOpenChange={setOpen}
          trigger={
            <DialogTrigger asChild>
              <DesktopSearchButton />
            </DialogTrigger>
          }
        >
          <DesktopCommandWithAskAI
            domain={domain}
            askAI={askAi}
            setAskAI={setAskAi}
            onEscapeKeyDown={() => setOpen(false)}
            api="/api/chat"
            suggestionsApi="/api/suggest"
            initialInput={initialInput}
            setInitialInput={setInitialInput}
            body={{
              algoliaSearchKey: apiKey,
              domain,
              model,
            }}
            onSelectHit={handleSubmit}
            composerActions={
              <ChatbotModelSelect value={model} onValueChange={setModel} />
            }
          >
            <DefaultDesktopBackButton />

            <CommandGroupFilters />
            <CommandEmpty />
            <CommandSearchHits onSelect={handleSubmit} domain={domain} />
            <CommandActions>
              <CommandGroupTheme setTheme={setTheme} />
            </CommandActions>
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
