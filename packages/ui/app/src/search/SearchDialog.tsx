import { useAtomValue, useSetAtom } from "jotai";
import { PropsWithChildren, ReactElement, useMemo, useRef } from "react";
import { InstantSearch } from "react-instantsearch";
import { CURRENT_VERSION_ATOM, IS_MOBILE_SCREEN_ATOM, SEARCH_DIALOG_OPEN_ATOM, useSidebarNodes } from "../atoms";
import { useSearchConfig } from "../services/useSearchService";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { SearchMobileHits } from "./SearchHits";
import { AlgoliaSearchDialog } from "./algolia/AlgoliaSearchDialog";
import { SearchMobileBox } from "./algolia/SearchBox";
import { useAlgoliaSearchClient } from "./algolia/useAlgoliaSearchClient";
import { CohereChatButton } from "./cohere/CohereChatButton";
import { InkeepChatButton } from "./inkeep/InkeepChatButton";
import { InkeepCustomTrigger } from "./inkeep/InkeepCustomTrigger";
import { useSearchTrigger } from "./useSearchTrigger";
import { createSearchPlaceholderWithVersion } from "./util";

export const SearchDialog = (): ReactElement | null => {
    const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
    useSearchTrigger(setSearchDialogState);

    const [config] = useSearchConfig();

    if (!config.isAvailable) {
        return null;
    }

    if (config.inkeep == null) {
        return (
            <>
                <AlgoliaSearchDialog />
                <CohereChatButton />
            </>
        );
    } else {
        return (
            <>
                {config.inkeep.replaceSearch ? <InkeepCustomTrigger /> : <AlgoliaSearchDialog />}
                <InkeepChatButton />
            </>
        );
    }
};

export declare namespace SearchSidebar {
    export interface Props {}
}

export const SearchSidebar: React.FC<PropsWithChildren<SearchSidebar.Props>> = ({ children }) => {
    const sidebar = useSidebarNodes();
    const activeVersion = useAtomValue(CURRENT_VERSION_ATOM);
    const placeholder = useMemo(
        () => createSearchPlaceholderWithVersion(activeVersion, sidebar),
        [activeVersion, sidebar],
    );

    const [searchConfig] = useSearchConfig();
    const algoliaSearchClient = useAlgoliaSearchClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);

    if (!searchConfig.isAvailable || !isMobileScreen) {
        return <>{children}</>;
    }

    if (searchConfig.inkeep?.replaceSearch !== true && algoliaSearchClient != null) {
        const [searchClient, indexName] = algoliaSearchClient;

        return (
            <InstantSearch searchClient={searchClient} indexName={indexName}>
                <SearchMobileBox ref={inputRef} placeholder={placeholder} className="mx-4 mt-4" />
                <SearchMobileHits>{children}</SearchMobileHits>
            </InstantSearch>
        );
    }

    if (searchConfig.inkeep != null) {
        return (
            <>
                <div className="p-4 pb-0">
                    <SidebarSearchBar className="w-full" hideKeyboardShortcutHint={true} />
                </div>
                {children}
            </>
        );
    }

    return <>{children}</>;
};
