import { Dialog, Transition } from "@headlessui/react";
import algolia from "algoliasearch/lite";
import { Fragment, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { InstantSearch } from "react-instantsearch-hooks-web";
import { useNavigationContext } from "../navigation-context";
import { type SearchCredentials, type SearchService } from "../services/useSearchService";
import { useCloseSearchDialog, useIsSearchDialogOpen } from "../sidebar/atom";
import { useViewportContext } from "../viewport-context/useViewportContext";
import { SearchBox, SearchMobileBox } from "./SearchBox";
import styles from "./SearchDialog.module.scss";
import { SearchHits, SearchMobileHits } from "./SearchHits";

export declare namespace SearchDialog {
    export interface Props {
        searchService: SearchService;
    }
}

export const SearchDialog: React.FC<SearchDialog.Props> = (providedProps) => {
    const { activeNavigatable } = useNavigationContext();
    const { searchService } = providedProps;
    const [credentials, setSearchCredentials] = useState<SearchCredentials | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const { layoutBreakpoint } = useViewportContext();

    const isSearchDialogOpen = useIsSearchDialogOpen();
    const closeSearchDialog = useCloseSearchDialog();

    useEffect(() => {
        if (searchService.isAvailable) {
            void searchService.loadCredentials().then(setSearchCredentials);
        }
    }, [searchService]);

    const searchClient = useMemo(() => {
        if (credentials?.appId == null) {
            return undefined;
        }
        return algolia(credentials.appId, credentials.searchApiKey);
    }, [credentials?.appId, credentials?.searchApiKey]);

    if (!searchService.isAvailable || searchClient == null || layoutBreakpoint === "mobile") {
        return null;
    }

    return (
        <InstantSearch searchClient={searchClient} indexName={searchService.index}>
            <Transition show={isSearchDialogOpen} as={Fragment} appear={true}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-30 hidden sm:block"
                    onClose={closeSearchDialog}
                    initialFocus={inputRef}
                >
                    <Transition.Child
                        as="div"
                        className="bg-background-light/50 dark:bg-background-dark/50 fixed inset-0 z-0"
                        enter="transition-opacity ease-linear duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                    />
                    <Dialog.Panel className="border-default bg-background-translucent relative z-10 mx-6 my-10 flex h-auto max-h-96 flex-col overflow-hidden rounded-xl border text-left align-middle shadow-2xl backdrop-blur-lg md:mx-auto md:max-w-2xl">
                        <div className={styles.searchBox}>
                            <SearchBox
                                ref={inputRef}
                                placeholder={
                                    activeNavigatable?.context.version?.info.id != null
                                        ? `Search across ${activeNavigatable.context.version.info.id}...`
                                        : "Search for guides and endpoints..."
                                }
                                className="flex-1"
                                inputClassName="form-input w-full text-base t-muted placeholder:t-muted !p-5 form-input !border-none !bg-transparent !outline-none !ring-0"
                            />
                        </div>
                        <SearchHits />
                    </Dialog.Panel>
                </Dialog>
            </Transition>
        </InstantSearch>
    );
};

export declare namespace SearchSidebar {
    export interface Props {
        searchService: SearchService;
    }
}

export const SearchSidebar: React.FC<PropsWithChildren<SearchSidebar.Props>> = (providedProps) => {
    const { activeNavigatable } = useNavigationContext();
    const { searchService, children } = providedProps;
    const [credentials, setSearchCredentials] = useState<SearchCredentials | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const { layoutBreakpoint } = useViewportContext();

    useEffect(() => {
        if (searchService.isAvailable) {
            void searchService.loadCredentials().then(setSearchCredentials);
        }
    }, [searchService]);

    const searchClient = useMemo(() => {
        if (credentials?.appId == null) {
            return undefined;
        }
        return algolia(credentials.appId, credentials.searchApiKey);
    }, [credentials?.appId, credentials?.searchApiKey]);

    if (!searchService.isAvailable || searchClient == null || layoutBreakpoint !== "mobile") {
        return <>{children}</>;
    }

    return (
        <InstantSearch searchClient={searchClient} indexName={searchService.index}>
            <SearchMobileBox
                ref={inputRef}
                placeholder={
                    activeNavigatable?.context.version?.info.id != null
                        ? `Search across ${activeNavigatable.context.version.info.id}...`
                        : "Search for guides and endpoints..."
                }
                className="mt-4 flex-1"
                inputClassName={styles.searchBox}
            />
            <SearchMobileHits>{children}</SearchMobileHits>
        </InstantSearch>
    );
};
