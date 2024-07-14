// import { Dialog, Transition } from "@headlessui/react";
import * as Dialog from "@radix-ui/react-dialog";
import { SearchClient } from "algoliasearch";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactElement, useMemo, useRef } from "react";
import { InstantSearch } from "react-instantsearch";
import { CURRENT_VERSION_ATOM, POSITION_SEARCH_DIALOG_OVER_HEADER_ATOM, useSidebarNodes } from "../../atoms";

import { IS_MOBILE_SCREEN_ATOM, SEARCH_DIALOG_OPEN_ATOM, useIsSearchDialogOpen } from "../../atoms";
import { SearchHits } from "../SearchHits";
import { createSearchPlaceholderWithVersion } from "../util";
import { SearchBox } from "./SearchBox";
import { useAlgoliaSearchClient } from "./useAlgoliaSearchClient";

export function AlgoliaSearchDialog(): ReactElement | null {
    const inputRef = useRef<HTMLInputElement>(null);
    const isMobileScreen = useAtomValue(IS_MOBILE_SCREEN_ATOM);
    const fromHeader = useAtomValue(POSITION_SEARCH_DIALOG_OVER_HEADER_ATOM);

    const isSearchDialogOpen = useIsSearchDialogOpen();
    const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
    const algoliaSearchClient = useAlgoliaSearchClient();
    if (algoliaSearchClient == null || isMobileScreen) {
        return null;
    }
    const [searchClient, index] = algoliaSearchClient;
    return (
        <Dialog.Root open={isSearchDialogOpen} onOpenChange={setSearchDialogState}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-0 bg-background/50 backdrop-blur-sm max-sm:hidden" />
                <Dialog.Content
                    className={clsx(
                        "fixed md:max-w-content-width my-[10vh] top-0 inset-x-0 z-10 mx-6 max-h-[80vh] md:mx-auto flex flex-col",
                        { "mt-4": fromHeader },
                    )}
                >
                    <FernInstantSearch searchClient={searchClient} indexName={index} inputRef={inputRef} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

interface FernInstantSearchProps {
    searchClient: SearchClient;
    indexName: string;
    inputRef: React.RefObject<HTMLInputElement>;
}

function FernInstantSearch({ searchClient, indexName, inputRef }: FernInstantSearchProps) {
    const sidebar = useSidebarNodes();
    const activeVersion = useAtomValue(CURRENT_VERSION_ATOM);
    const placeholder = useMemo(
        () => createSearchPlaceholderWithVersion(activeVersion, sidebar),
        [activeVersion, sidebar],
    );
    return (
        <InstantSearch searchClient={searchClient} indexName={indexName}>
            <div className="bg-search-dialog border-default flex h-auto min-h-0 shrink flex-col overflow-hidden rounded-xl border text-left align-middle shadow-2xl backdrop-blur-lg">
                <SearchBox
                    ref={inputRef}
                    placeholder={placeholder}
                    className="flex-1"
                    inputClassName="form-input w-full text-base t-muted placeholder:t-muted !p-5 form-input !border-none !bg-transparent !outline-none !ring-0"
                />
                <SearchHits />
            </div>
        </InstantSearch>
    );
}
