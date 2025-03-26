"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { isEqual } from "es-toolkit/predicate";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { z } from "zod";

import {
  CommandActions,
  CommandEmpty,
  CommandGroupFilters,
  CommandGroupTheme,
  CommandSearchHits,
  DefaultDesktopBackButton,
  DesktopCommand,
  DesktopCommandWithAskAI,
  DesktopSearchDialog,
  SEARCH_INDEX,
  SearchClientRoot,
} from "@fern-docs/search-ui";
import { VersionSwitcherInfo } from "@fern-platform/fdr-utils";
import { useEventCallback, useLazyRef } from "@fern-ui/react-commons";

import { Feedback } from "@/components/feedback/Feedback";
import { useApiRoute } from "@/components/hooks/useApiRoute";
import { useApiRouteSWRImmutable } from "@/components/hooks/useApiRouteSWR";
import { useCurrentPathname } from "@/hooks/use-current-pathname";
import { useSetTheme, useThemeSwitchEnabled } from "@/hooks/use-theme";
import { useIsDarkCode } from "@/state/dark-code";
import { useFernUser } from "@/state/fern-user";
import { searchDialogOpenAtom, searchInitializedAtom } from "@/state/search";
import { atomWithStorageString } from "@/state/utils/atomWithStorageString";

const ALGOLIA_USER_TOKEN_KEY = "algolia-user-token";

const ApiKeySchema = z.object({
  appId: z.string(),
  apiKey: z.string(),
});

function useAlgoliaUserToken() {
  const userTokenRef = useLazyRef(() =>
    atomWithStorageString(
      ALGOLIA_USER_TOKEN_KEY,
      `anonymous-user-${crypto.randomUUID()}`,
      { getOnInit: true }
    )
  );
  return useAtomValue(userTokenRef.current);
}

const askAiAtom = atom(false);

export const SearchV2 = React.memo(function SearchV2({
  domain,
  version,
  isAskAiEnabled,
}: {
  domain: string;
  isAskAiEnabled: boolean;
  version?: VersionSwitcherInfo;
}) {
  const isDarkCodeEnabled = useIsDarkCode();
  const userToken = useAlgoliaUserToken();
  const user = useFernUser();

  const [open, setOpen] = useCommandTrigger();
  const [askAi, setAskAi] = useAtom(askAiAtom);
  const [initialInput, setInitialInput] = React.useState("");

  const { data } = useApiRouteSWRImmutable("/api/fern-docs/search/v2/key", {
    request: { headers: { "X-User-Token": userToken } },
    validate: ApiKeySchema,
    // api key expires 24 hours, so we refresh it every hour
    refreshInterval: 60 * 60 * 1000,
    preload: true,
  });

  const facetApiEndpoint = useApiRoute("/api/fern-docs/search/v2/facet");
  let chatEndpoint = useApiRoute("/api/fern-docs/search/v2/chat");
  let suggestEndpoint = useApiRoute("/api/fern-docs/search/v2/suggest");

  // Rerouting to ferndocs.com for production environments to ensure streaming works
  // Also see: next.config.mjs, where we set CORS headers
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    chatEndpoint = `${process.env.NEXT_PUBLIC_CDN_URI}/api/fern-docs/search/v2/chat`;
    suggestEndpoint = `${process.env.NEXT_PUBLIC_CDN_URI}/api/fern-docs/search/v2/suggest`;
  }

  const router = useRouter();

  const handleNavigate = useEventCallback((path: string) => {
    router.push(path, { scroll: true });
    setOpen(false);
  });

  const facetFetcher = React.useCallback(
    async (filters: readonly string[]) => {
      if (!data) {
        return {};
      }
      const searchParams = new URLSearchParams();
      searchParams.append("apiKey", data.apiKey);
      filters.forEach((filter) => searchParams.append("filters", filter));
      const search = String(searchParams);
      const res = await fetch(`${facetApiEndpoint}?${search}`, {
        method: "GET",
      });
      return res.json();
    },
    [data, facetApiEndpoint]
  );

  const setInitialized = useSetAtom(searchInitializedAtom);
  // initialize the search dialog when the data is loaded
  React.useEffect(() => {
    setInitialized(data != null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // close the search dialog when the pathname changes
  const pathname = useCurrentPathname();
  React.useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!data) {
    return null;
  }

  const { appId, apiKey } = data;

  const children = (
    <>
      <DefaultDesktopBackButton />
      <CommandGroupFilters />
      <CommandEmpty />
      <CommandSearchHits
        onSelect={handleNavigate}
        prefetch={(path) => router.prefetch(path)}
        domain={domain}
      />
      <CommandActions>
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
      <DesktopSearchDialog open={open} onOpenChange={setOpen}>
        {isAskAiEnabled ? (
          <DesktopCommandWithAskAI
            domain={domain}
            askAI={askAi}
            setAskAI={setAskAi}
            api={chatEndpoint}
            headers={{
              "X-Fern-Host": domain,
            }}
            suggestionsApi={suggestEndpoint}
            initialInput={initialInput}
            setInitialInput={setInitialInput}
            body={{ algoliaSearchKey: apiKey }}
            onSelectHit={handleNavigate}
            onEscapeKeyDown={() => setOpen(false)}
            renderActions={({ user, assistant }) => {
              if (!assistant) {
                return null;
              }
              return (
                <Feedback
                  feedbackQuestion="Was this response helpful?"
                  type="conversational-search"
                  metadata={() => ({
                    user: user?.content,
                    assistant: assistant.content,
                  })}
                />
              );
            }}
            darkCodeEnabled={isDarkCodeEnabled}
            className="shadow-xl"
          >
            {children}
          </DesktopCommandWithAskAI>
        ) : (
          <DesktopCommand
            onEscapeKeyDown={() => setOpen(false)}
            className="shadow-xl"
          >
            {children}
          </DesktopCommand>
        )}
      </DesktopSearchDialog>
    </SearchClientRoot>
  );
}, isEqual);

function CommandTheme({ onClose }: { onClose: () => void }) {
  const themeSwitchEnabled = useThemeSwitchEnabled();
  const setTheme = useSetTheme();
  if (!themeSwitchEnabled) {
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

function useCommandTrigger(): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
] {
  const [open, setOpen] = useAtom(searchDialogOpenAtom);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (open) {
        return;
      }

      setOpen((prev) => {
        if (prev) {
          return prev;
        }

        // support for cmd+k
        if ((event.metaKey || event.ctrlKey) && event.key === "k") {
          event.preventDefault();
          return true;
        }

        // support for / key (only if not in an input)
        if (
          event.key === "/" &&
          !(document.activeElement instanceof HTMLInputElement) &&
          !(document.activeElement instanceof HTMLTextAreaElement) &&
          !(
            document.activeElement instanceof HTMLElement &&
            document.activeElement.isContentEditable
          )
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
  }, [open, setOpen]);

  return [open, setOpen];
}

export default SearchV2;
