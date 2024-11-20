import { FacetName } from "@/utils/facet-display";
import "instantsearch.css/themes/reset.css";
import { PropsWithChildren, type ReactElement } from "react";
import { FernDocsInstantSearch } from "../shared/FernDocsInstantSearch";
import { MobileCommandController } from "./MobileCommandController";

interface MobileInstantSearchProps {
    /**
     * Callback for when a search result is selected.
     */
    onSelect: (path: string) => void;
    /**
     * Callback for when the theme is changed.
     */
    setTheme?: (theme: "light" | "dark" | "system") => void;
    /**
     * Callback for when the AI Ask feature is used.
     */
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    /**
     * Pre-fill facet filters as soon as the component mounts.
     */
    initialFilters?: Partial<Record<FacetName, string>>;
    /**
     * Client-side generated user token for Algolia Insights.
     * This should be a UUID stored in session storage
     */
    userToken?: string;
    /**
     * This must be a user ID that uniquely identifies the user,
     * and will only be used for Algolia Insights.
     * This could be workos ID, email address, or something similar.
     * @format [A-Za-z0-9_=+/-]{1,129}
     */
    authenticatedUserToken?: string;
}

export function MobileInstantSearch({
    onSelect,
    setTheme,
    onAskAI,
    initialFilters,
    userToken,
    authenticatedUserToken,
    children,
}: PropsWithChildren<MobileInstantSearchProps>): ReactElement {
    return (
        <FernDocsInstantSearch
            initialFilters={initialFilters}
            userToken={userToken}
            authenticatedUserToken={authenticatedUserToken}
        >
            <MobileCommandController onSelect={onSelect} onAskAI={onAskAI} setTheme={setTheme}>
                {children}
            </MobileCommandController>
        </FernDocsInstantSearch>
    );
}
