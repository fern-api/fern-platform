import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import algolia from "algoliasearch/lite";
import classNames from "classnames";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { InstantSearch } from "react-instantsearch-hooks-web";
import { type SearchCredentials, type SearchService } from "../services/useSearchService";
import { SearchBox } from "./SearchBox";
import styles from "./SearchDialog.module.scss";
import { SearchHits } from "./SearchHits";

export declare namespace SearchDialog {
    export interface Props {
        isOpen: boolean;
        onClose: () => void;
        activeVersion?: string;
        searchService: SearchService;
    }
}

export const SearchDialog: React.FC<SearchDialog.Props> = (providedProps) => {
    const { isOpen, onClose, activeVersion, searchService } = providedProps;
    const [credentials, setSearchCredentials] = useState<SearchCredentials | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

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

    if (!searchService.isAvailable || searchClient == null) {
        return null;
    }

    return (
        <InstantSearch searchClient={searchClient} indexName={searchService.index}>
            <Transition show={isOpen} as={Fragment} appear={true}>
                <Dialog as="div" className="fixed inset-0 z-30" onClose={onClose} initialFocus={inputRef}>
                    <Transition.Child
                        as="div"
                        className="bg-background-light/40 dark:bg-background-dark/40 fixed inset-0 z-0 backdrop-blur-sm"
                        enter="transition-all ease-linear duration-200"
                        enterFrom="backdrop-blur-0 opacity-0"
                        enterTo="backdrop-blur-sm opacity-100"
                    />
                    <Dialog.Panel className="border-border-default-light dark:border-border-default-dark bg-background-primary-light dark:bg-background-primary-dark relative z-10 mx-auto flex h-screen w-full flex-col overflow-hidden text-left align-middle shadow-2xl md:my-10 md:h-auto md:max-h-96 md:max-w-2xl md:rounded-md md:border">
                        <div className={classNames(styles.searchBox, "flex items-center space-x-3 px-5")}>
                            <MagnifyingGlassIcon className="t-muted size-5" />
                            <SearchBox
                                ref={inputRef}
                                placeholder={
                                    activeVersion != null
                                        ? `Search across version ${activeVersion}`
                                        : "Find something..."
                                }
                                className="flex-1"
                                inputClassName="form-input border-none w-full text-base t-muted placeholder:text-text-muted-light placeholder:dark:text-text-muted-dark bg-transparent py-5 focus:outline-none focus:ring-0"
                            />
                        </div>
                        <SearchHits />
                    </Dialog.Panel>
                </Dialog>
            </Transition>
        </InstantSearch>
    );
};
