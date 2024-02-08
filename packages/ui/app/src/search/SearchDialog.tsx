import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import algolia from "algoliasearch/lite";
import classNames from "classnames";
import { Fragment, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { InstantSearch } from "react-instantsearch-hooks-web";
import { useNavigationContext } from "../navigation-context";
import { type SearchCredentials, type SearchService } from "../services/useSearchService";
import { useViewportContext } from "../viewport-context/useViewportContext";
import { SearchBox, SearchMobileBox } from "./SearchBox";
import styles from "./SearchDialog.module.scss";
import { SearchHits, SearchMobileHits } from "./SearchHits";

export declare namespace SearchDialog {
    export interface Props {
        isOpen: boolean;
        onClose: () => void;
        searchService: SearchService;
    }
}

export const SearchDialog: React.FC<SearchDialog.Props> = (providedProps) => {
    const { activeNavigatable } = useNavigationContext();
    const { isOpen, onClose, searchService } = providedProps;
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

    if (!searchService.isAvailable || searchClient == null || layoutBreakpoint === "mobile") {
        return null;
    }

    return (
        <InstantSearch searchClient={searchClient} indexName={searchService.index}>
            <Transition show={isOpen} as={Fragment} appear={true}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-30 hidden sm:block"
                    onClose={onClose}
                    initialFocus={inputRef}
                >
                    <Transition.Child
                        as="div"
                        className="bg-background-light/40 dark:bg-background-dark/40 fixed inset-0 z-0 backdrop-blur-sm"
                        enter="transition-all ease-linear duration-200"
                        enterFrom="backdrop-blur-0 opacity-0"
                        enterTo="backdrop-blur-sm opacity-100"
                    />
                    <Dialog.Panel className="border-default bg-background-primary-light dark:bg-background-primary-dark fle relative z-10 mx-6 my-10 h-auto max-h-96 flex-col overflow-hidden rounded-md border text-left align-middle shadow-2xl md:mx-auto md:max-w-2xl">
                        <div className={classNames(styles.searchBox, "flex items-center space-x-3 px-5")}>
                            <MagnifyingGlassIcon className="t-muted size-5" />
                            <SearchBox
                                ref={inputRef}
                                placeholder={
                                    activeNavigatable.context.version?.info.id != null
                                        ? `Search across version ${activeNavigatable.context.version?.info.id}`
                                        : "Find something..."
                                }
                                className="flex-1"
                                inputClassName="form-input w-full text-base t-muted placeholder:t-muted !py-5 form-input !border-none !bg-transparent !outline-none !ring-0"
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
                    activeNavigatable.context.version?.info.id != null
                        ? `Search across version ${activeNavigatable.context.version?.info.id}`
                        : "Find something..."
                }
                className="mt-4 flex-1"
            />
            <SearchMobileHits>{children}</SearchMobileHits>
        </InstantSearch>
    );
};
