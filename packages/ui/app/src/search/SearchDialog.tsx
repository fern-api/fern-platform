import { useSetAtom } from "jotai";
import { PropsWithChildren, useMemo, useRef } from "react";
import { InstantSearch } from "react-instantsearch";
import { useSidebarNodes } from "../atoms/navigation";
import { SEARCH_DIALOG_OPEN_ATOM } from "../atoms/sidebar";
import { useLayoutBreakpointValue } from "../atoms/window";
import { useNavigationContext } from "../contexts/navigation-context";
import { useSearchConfig } from "../services/useSearchService";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { SearchMobileHits } from "./SearchHits";
import { AlgoliaSearchDialog } from "./algolia/AlgoliaSearchDialog";
import { SearchMobileBox } from "./algolia/SearchBox";
import { useAlgoliaSearchClient } from "./algolia/useAlgoliaSearchClient";
import { InkeepChatButton } from "./inkeep/InkeepChatButton";
import { InkeepCustomTrigger } from "./inkeep/InkeepCustomTrigger";
import { useSearchTrigger } from "./useSearchTrigger";
import { createSearchPlaceholderWithVersion } from "./util";

export declare namespace SearchDialog {
    export interface Props {
        fromHeader?: boolean;
    }
}

export const SearchDialog: React.FC<SearchDialog.Props> = ({ fromHeader }) => {
    const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
    useSearchTrigger(setSearchDialogState);

    const [config] = useSearchConfig();

    if (!config.isAvailable) {
        return null;
    }

    if (config.inkeep == null) {
        return <AlgoliaSearchDialog fromHeader={fromHeader} />;
    } else {
        return (
            <>
                {config.inkeep.replaceSearch ? (
                    <InkeepCustomTrigger />
                ) : (
                    <AlgoliaSearchDialog fromHeader={fromHeader} />
                )}
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
    const { activeVersion } = useNavigationContext();
    const placeholder = useMemo(
        () => createSearchPlaceholderWithVersion(activeVersion, sidebar),
        [activeVersion, sidebar],
    );

    const [searchConfig] = useSearchConfig();
    const algoliaSearchClient = useAlgoliaSearchClient();
    const inputRef = useRef<HTMLInputElement>(null);
    const layoutBreakpoint = useLayoutBreakpointValue();

    if (!searchConfig.isAvailable || layoutBreakpoint !== "mobile") {
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
