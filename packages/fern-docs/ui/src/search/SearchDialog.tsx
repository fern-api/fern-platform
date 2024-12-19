import { getDevice, getPlatform } from "@fern-api/ui-core-utils";
import { createSearchPlaceholderWithVersion } from "@fern-docs/search-utils";
import { useAtomValue, useSetAtom } from "jotai";
import { PropsWithChildren, ReactNode, useMemo, useRef } from "react";
import { Configure, InstantSearch } from "react-instantsearch";
import {
  CURRENT_VERSION_ATOM,
  IS_MOBILE_SCREEN_ATOM,
  SEARCH_DIALOG_OPEN_ATOM,
  useDomain,
  useFeatureFlag,
  useFeatureFlags,
  useIsSearchDialogOpen,
  useSidebarNodes,
} from "../atoms";
import { useSearchConfig } from "../services/useSearchService";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { getFeatureFlagFilters } from "../util/getFeatureFlagFilters";
import { SearchMobileHits } from "./SearchHits";
import { AlgoliaSearchDialog } from "./algolia/AlgoliaSearchDialog";
import { SearchMobileBox } from "./algolia/SearchBox";
import { useAlgoliaSearchClient } from "./algolia/useAlgoliaSearchClient";
import { InkeepChatButton } from "./inkeep/InkeepChatButton";
import { InkeepCustomTrigger } from "./inkeep/InkeepCustomTrigger";
import { useSearchTrigger } from "./useSearchTrigger";

export const SearchDialog = (): ReactNode => {
  const isSearchV2Enabled = useFeatureFlag("isSearchV2Enabled");
  if (isSearchV2Enabled) {
    return false;
  }
  return <InternalSearchDialog />;
};

const InternalSearchDialog = (): ReactNode => {
  const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
  useSearchTrigger(setSearchDialogState);
  const isSearchDialogOpen = useIsSearchDialogOpen();

  const config = useSearchConfig();

  if (!config.isAvailable) {
    if (isSearchDialogOpen) {
      // TODO: sentry
      // eslint-disable-next-line no-console
      console.error("Search dialog is null, when attempting to use search.");
    }
    return null;
  }

  if (config.inkeep == null) {
    return <AlgoliaSearchDialog />;
  } else {
    return (
      <>
        {config.inkeep.replaceSearch ? (
          <InkeepCustomTrigger />
        ) : (
          <AlgoliaSearchDialog />
        )}
        <InkeepChatButton />
      </>
    );
  }
};

export declare namespace SearchSidebar {
  export interface Props {}
}

export const SearchSidebar: React.FC<
  PropsWithChildren<SearchSidebar.Props>
> = ({ children }) => {
  const domain = useDomain();
  const sidebar = useSidebarNodes();
  const activeVersion = useAtomValue(CURRENT_VERSION_ATOM);
  const placeholder = useMemo(
    () => createSearchPlaceholderWithVersion(activeVersion?.id, sidebar),
    [activeVersion, sidebar]
  );

  const searchConfig = useSearchConfig();
  const algoliaSearchClient = useAlgoliaSearchClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);

  const { isNewSearchExperienceEnabled } = useFeatureFlags();

  if (!searchConfig.isAvailable || !isMobileScreen) {
    return children;
  }

  if (
    searchConfig.inkeep?.replaceSearch !== true &&
    algoliaSearchClient != null
  ) {
    const [searchClient, indexName] = algoliaSearchClient;

    return (
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <Configure
          filters={getFeatureFlagFilters(isNewSearchExperienceEnabled)}
          hitsPerPage={40}
          analytics
          analyticsTags={[
            "search-v1-mobile",
            getPlatform(),
            getDevice(),
            domain,
          ]}
        />
        <SearchMobileBox
          ref={inputRef}
          placeholder={placeholder}
          className="mx-4 mt-4"
        />
        <SearchMobileHits>{children}</SearchMobileHits>
      </InstantSearch>
    );
  }

  if (searchConfig.inkeep != null) {
    return (
      <>
        <div className="p-4 pb-0">
          <SidebarSearchBar
            className="w-full"
            hideKeyboardShortcutHint={true}
          />
        </div>
        {children}
      </>
    );
  }

  return children;
};
