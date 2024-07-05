// import { Dialog, Transition } from "@headlessui/react";
import * as Dialog from "@radix-ui/react-dialog";
import { SearchClient } from "algoliasearch";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { ReactElement, useMemo, useRef } from "react";
import { InstantSearch } from "react-instantsearch";
import { useSidebarNodes } from "../../atoms/navigation";
import { PORTAL_CONTAINER } from "../../atoms/portal";
import { SEARCH_DIALOG_OPEN_ATOM, useIsSearchDialogOpen } from "../../atoms/sidebar";
import { useLayoutBreakpointValue } from "../../atoms/viewport";
import { useNavigationContext } from "../../contexts/navigation-context";
import { SearchHits } from "../SearchHits";
import { createSearchPlaceholderWithVersion } from "../util";
import { SearchBox } from "./SearchBox";
import { useAlgoliaSearchClient } from "./useAlgoliaSearchClient";

export function AlgoliaSearchDialog({ fromHeader }: { fromHeader?: boolean }): ReactElement | null {
    const inputRef = useRef<HTMLInputElement>(null);
    const layoutBreakpoint = useLayoutBreakpointValue();

    const isSearchDialogOpen = useIsSearchDialogOpen();
    const setSearchDialogState = useSetAtom(SEARCH_DIALOG_OPEN_ATOM);
    const algoliaSearchClient = useAlgoliaSearchClient();
    const container = useAtomValue(PORTAL_CONTAINER);
    if (algoliaSearchClient == null || layoutBreakpoint === "mobile") {
        return null;
    }
    const [searchClient, index] = algoliaSearchClient;
    return (
        <Dialog.Root open={isSearchDialogOpen} onOpenChange={setSearchDialogState}>
            <Dialog.Portal container={container}>
                <Dialog.Overlay className="fixed inset-0 z-0 bg-background/50 backdrop-blur-sm max-sm:hidden" />
                <Dialog.Content className="fixed inset-0 z-30 max-sm:hidden">
                    <div
                        className={clsx(
                            "md:max-w-content-width my-header-height-padded relative z-10 mx-6 max-h-[calc(100vh-var(--spacing-header-height)-var(--spacing-header-height)-2rem)] md:mx-auto flex flex-col",
                            {
                                "mt-4": fromHeader,
                            },
                        )}
                    >
                        <FernInstantSearch searchClient={searchClient} indexName={index} inputRef={inputRef} />
                    </div>
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
    const { activeVersion } = useNavigationContext();
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
