import { Dialog, Transition } from "@headlessui/react";
import algolia from "algoliasearch/lite";
import classNames from "classnames";
import { Fragment, useEffect, useMemo, useState } from "react";
import { InstantSearch } from "react-instantsearch-hooks-web";
import { SearchIcon } from "../commons/icons/SearchIcon";
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
                <Dialog as="div" className="fixed inset-0 z-30" onClose={onClose}>
                    <div className="flex min-h-screen items-start justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="transition-all ease-linear duration-200"
                            enterFrom="backdrop-blur-0 opacity-0"
                            enterTo="backdrop-blur-sm opacity-100"
                        >
                            <Dialog.Overlay className="bg-background/40 dark:bg-background-dark/40 fixed inset-0 backdrop-blur-sm" />
                        </Transition.Child>
                        <div className="border-border-default-light dark:border-border-default-dark bg-background-primary-light dark:bg-background-primary-dark z-10 mx-3 mb-8 mt-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-md border text-left align-middle shadow-2xl">
                            <div className={classNames(styles.searchBox, "flex items-center space-x-3 px-5")}>
                                <SearchIcon className="t-muted size-5" />
                                <SearchBox
                                    placeholder={
                                        activeVersion != null
                                            ? `Search across version ${activeVersion}`
                                            : "Find something..."
                                    }
                                    className="flex-1"
                                    inputClassName="w-full text-base t-muted placeholder:text-text-muted-light placeholder:dark:text-text-muted-dark bg-transparent py-5 focus:outline-none"
                                />
                            </div>
                            <SearchHits />
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </InstantSearch>
    );
};
