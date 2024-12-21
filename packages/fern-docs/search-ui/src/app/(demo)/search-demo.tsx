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
  DesktopBackButton,
  DesktopCommandAboveInput,
  DesktopCommandBadges,
  DesktopCommandBeforeInput,
  DesktopSearchDialog,
  MobileCommand,
  SearchClientRoot,
  useFacetFilters,
} from "@/components";
import { ChatbotModelSelect } from "@/components/chatbot/model-select";
import { DesktopCommandWithAskAI } from "@/components/desktop/desktop-ask-ai";
import { CommandAskAIGroup } from "@/components/shared/command-ask-ai";
import { useIsMobile } from "@/hooks/use-mobile";
import { isPlainObject } from "@fern-api/ui-core-utils";
import { FacetsResponse, SEARCH_INDEX } from "@fern-docs/search-server/algolia";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const isTrieve = searchParams.get("provider") === "trieve";
  const trieveApiKey = isTrieve ? searchParams.get("apiKey") : undefined;
  const trieveDatasetId = isTrieve ? searchParams.get("datasetId") : undefined;
  const trieveOrganizationId = isTrieve
    ? searchParams.get("organizationId")
    : undefined;
  const [initialInput, setInitialInput] = useState("");
  const [askAi, setAskAi] = useState(false);
  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();
  const isMobile = useIsMobile();

  const [trieveTopicId, setTrieveTopicId] = useState<string | undefined>(
    undefined
  );

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
        <DesktopSearchDialog open={open} onOpenChange={setOpen} asChild>
          <DesktopCommandWithAskAI
            domain={domain}
            askAI={askAi}
            setAskAI={setAskAi}
            onClose={() => setOpen(false)}
            api={isTrieve ? "/api/trieve" : "/api/chat"}
            suggestionsApi="/api/suggest"
            initialInput={initialInput}
            body={
              isTrieve
                ? {
                    apiKey: trieveApiKey,
                    datasetId: trieveDatasetId,
                    organizationId: trieveOrganizationId,
                    topicId: trieveTopicId,
                  }
                : {
                    algoliaSearchKey: apiKey,
                    domain,
                    model,
                  }
            }
            onSelectHit={handleSubmit}
            composerActions={
              !isTrieve && (
                <ChatbotModelSelect value={model} onValueChange={setModel} />
              )
            }
            onData={(data) => {
              const topicId = data
                .filter(isPlainObject)
                .find((d) => d.type === "topic_id")?.topic_id;
              if (topicId && typeof topicId === "string") {
                setTrieveTopicId(topicId);
              }
            }}
          >
            <DesktopCommandAboveInput>
              <DesktopCommandBadges />
            </DesktopCommandAboveInput>

            <DesktopCommandBeforeInput>
              <BackButton askAi={askAi} setAskAi={setAskAi} />
            </DesktopCommandBeforeInput>

            <CommandAskAIGroup
              onAskAI={(initialInput) => {
                setInitialInput(initialInput);
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
          </DesktopCommandWithAskAI>
        </DesktopSearchDialog>
      )}
    </SearchClientRoot>
  );
}

function BackButton({
  askAi,
  setAskAi,
}: {
  askAi: boolean;
  setAskAi: (askAi: boolean) => void;
}) {
  const { filters, popFilter, clearFilters } = useFacetFilters();
  // const { focus } = useCommandUx();

  if (filters.length === 0 && !askAi) {
    return false;
  }

  return (
    <DesktopBackButton
      pop={() => {
        if (askAi) {
          setAskAi(false);
        } else {
          popFilter();
        }
      }}
      clear={() => {
        if (askAi) {
          setAskAi(false);
        } else {
          clearFilters();
        }
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
