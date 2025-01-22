import {
  CommandActions,
  CommandEmpty,
  CommandGroupFilters,
  CommandGroupPlayground,
  CommandGroupTheme,
  CommandSearchHits,
  DefaultDesktopBackButton,
  DesktopCommand,
  DesktopCommandWithAskAI,
  DesktopSearchButton,
  DesktopSearchDialog,
  SEARCH_INDEX,
  SearchClientRoot,
  useIsMobile,
} from "@fern-docs/search-ui";
import { useEventCallback } from "@fern-ui/react-commons";
import { atom, useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/router";
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { z } from "zod";

import {
  CURRENT_VERSION_ATOM,
  DOMAIN_ATOM,
  HAS_API_PLAYGROUND,
  THEME_SWITCH_ENABLED_ATOM,
  atomWithStorageString,
  useClosePlayground,
  useEdgeFlags,
  useFernUser,
  useIsPlaygroundOpen,
  useSetTheme,
  useTogglePlayground,
} from "../atoms";
import { Feedback } from "../feedback/Feedback";
import { useApiRoute } from "../hooks/useApiRoute";
import { useApiRouteSWRImmutable } from "../hooks/useApiRouteSWR";

const ALGOLIA_USER_TOKEN_KEY = "algolia-user-token";

const ApiKeySchema = z.object({
  appId: z.string(),
  apiKey: z.string(),
});

function useAlgoliaUserToken() {
  const userTokenRef = useRef(
    atomWithStorageString(
      ALGOLIA_USER_TOKEN_KEY,
      `anonymous-user-${crypto.randomUUID()}`,
      { getOnInit: true }
    )
  );
  return useAtomValue(userTokenRef.current);
}

const askAiAtom = atom(false);

export function SearchV2(): ReactElement | false {
  const version = useAtomValue(CURRENT_VERSION_ATOM);
  const { isAskAiEnabled } = useEdgeFlags();

  const userToken = useAlgoliaUserToken();
  const user = useFernUser();

  const [open, setOpen] = useCommandTrigger();
  const setCloseApiPlayground = useClosePlayground();
  const [askAi, setAskAi] = useAtom(askAiAtom);
  const [initialInput, setInitialInput] = useState("");
  const domain = useAtomValue(DOMAIN_ATOM);

  const { data } = useApiRouteSWRImmutable("/api/fern-docs/search/v2/key", {
    request: { headers: { "X-User-Token": userToken } },
    validate: ApiKeySchema,
    // api key expires 24 hours, so we refresh it every hour
    refreshInterval: 60 * 60 * 1000,
  });

  const facetApiEndpoint = useApiRoute("/api/fern-docs/search/v2/facet");
  let chatEndpoint = useApiRoute("/api/fern-docs/search/v2/chat");
  let suggestEndpoint = useApiRoute("/api/fern-docs/search/v2/suggest");

  // Rerouting to ferndocs.com for production environments to ensure streaming works
  // Also see: next.config.mjs, where we set CORS headers
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    chatEndpoint = `https://app.ferndocs.com/api/fern-docs/search/v2/chat`;
    suggestEndpoint = `https://app.ferndocs.com/api/fern-docs/search/v2/suggest`;
  }

  const router = useRouter();

  const handleNavigate = useEventCallback((path: string) => {
    void router.push(path).then(() => {
      setOpen(false);
      setCloseApiPlayground();
    });
  });

  const facetFetcher = useCallback(
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

  if (!data) {
    return <DesktopSearchButton variant="loading" />;
  }

  const { appId, apiKey } = data;

  const children = (
    <>
      <DefaultDesktopBackButton />
      <CommandGroupFilters />
      <CommandEmpty />
      <CommandSearchHits
        onSelect={handleNavigate}
        prefetch={router.prefetch}
        domain={domain}
      />
      <CommandActions>
        <CommandPlayground onClose={() => setOpen(false)} />
        <CommandTheme onClose={() => setOpen(false)} />
      </CommandActions>
    </>
  );

  const headers = withSkewProtection({
    "X-Fern-Host": domain,
  });
  headers;

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
      <DesktopSearchDialog
        open={open}
        onOpenChange={setOpen}
        trigger={<DesktopSearchButton />}
      >
        {isAskAiEnabled ? (
          <DesktopCommandWithAskAI
            domain={domain}
            askAI={askAi}
            setAskAI={setAskAi}
            api={chatEndpoint}
            headers={{
              "X-Fern-Host": domain,
              "X-Deployment-Id": process.env.NEXT_DEPLOYMENT_ID ?? "",
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
          >
            {children}
          </DesktopCommandWithAskAI>
        ) : (
          <DesktopCommand onEscapeKeyDown={() => setOpen(false)}>
            {children}
          </DesktopCommand>
        )}
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
  }, [isMobile]);
  return [open, setOpen];
}
