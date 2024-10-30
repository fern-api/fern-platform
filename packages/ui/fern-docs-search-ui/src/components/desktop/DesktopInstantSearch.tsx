import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import "instantsearch.css/themes/reset.css";
import {
    FormEvent,
    FormHTMLAttributes,
    PropsWithChildren,
    forwardRef,
    useEffect,
    useRef,
    type ReactElement,
} from "react";
import { Configure, useHits } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { LinkComponentType } from "../shared/LinkComponent";
import { SegmentedHits } from "../shared/SegmentedHits";
import { useTrapFocus } from "../shared/useTrapFocus";
import { DesktopSearchBox } from "./DesktopSearchBox";

interface DesktopInstantSearchProps {
    appId: string;
    apiKey: string;
    LinkComponent: LinkComponentType;
    onSubmit: (hit: { pathname: string; hash: string }) => void;
}

export function DesktopInstantSearch({
    appId,
    apiKey,
    LinkComponent,
    onSubmit,
}: DesktopInstantSearchProps): ReactElement {
    const ref = useRef(algoliasearch(appId, apiKey));
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ref.current.setClientApiKey({ apiKey });
    }, [apiKey]);

    useTrapFocus({ container: formRef.current });

    return (
        <div className="w-96">
            <InstantSearchNext
                searchClient={ref.current}
                indexName="fern-docs-search"
                future={{ preserveSharedStateOnUnmount: true }}
            >
                <Configure
                    restrictHighlightAndSnippetArrays={true}
                    distinct={true}
                    attributesToSnippet={["description:20", "content:20"]}
                    ignorePlurals
                />
                <DesktopSearchForm
                    className="flex flex-col gap-2 border border-[#DBDBDB] rounded-lg overflow-hidden bg-[#F2F2F2]/30 backdrop-blur-xl"
                    ref={formRef}
                    onSubmit={onSubmit}
                >
                    <div className="p-4 border-b border-[#DBDBDB]" onClick={() => inputRef.current?.focus()}>
                        <DesktopSearchBox
                            inputClassName="w-full focus:outline-none bg-transparent text-lg placeholder:text-[#969696]"
                            placeholder="Search"
                            autoFocus
                            inputRef={inputRef}
                            isFromSelection={false}
                        />
                    </div>
                    <SegmentedHits inputRef={inputRef} LinkComponent={LinkComponent} />
                </DesktopSearchForm>
            </InstantSearchNext>
        </div>
    );
}

interface DesktopSearchFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
    onSubmit: (hit: { pathname: string; hash: string }) => void;
}

const DesktopSearchForm = forwardRef<HTMLFormElement, PropsWithChildren<DesktopSearchFormProps>>(
    ({ children, onSubmit, ...props }, ref): ReactElement => {
        const { items } = useHits<AlgoliaRecord>();
        const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const radioGroup = event.currentTarget.elements.namedItem("fern-docs-search-selected-hit");
            if (radioGroup instanceof RadioNodeList) {
                const objectID = radioGroup.value;
                const hit = items.find((hit) => hit.objectID === objectID);
                if (hit) {
                    onSubmit({
                        pathname: hit.pathname ?? "",
                        hash: hit.hash ?? "",
                    });
                }
            }
        };
        return (
            <form ref={ref} onSubmit={handleSubmit} {...props}>
                {children}
            </form>
        );
    },
);
