import { FacetName } from "@/utils/facet-display";
import "instantsearch.css/themes/reset.css";
import { forwardRef } from "react";
import { FernDocsInstantSearch } from "../shared/fern-docs-instant-search";
import { DesktopCommandSharedProps } from "./desktop-command";
import { DesktopCommandController } from "./desktop-command-controller";

interface DesktopInstantSearchProps {
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
     * Callback for when the command is closed (i.e. when the user presses escape).
     */
    onClose?: () => void;
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
     */
    authenticatedUserToken?: string;
}

export const DesktopInstantSearch = forwardRef<HTMLDivElement, DesktopInstantSearchProps & DesktopCommandSharedProps>(
    (props, ref) => {
        const { onSelect, setTheme, onAskAI, initialFilters, userToken, authenticatedUserToken, ...rest } = props;
        return (
            <FernDocsInstantSearch
                initialFilters={initialFilters}
                userToken={userToken}
                authenticatedUserToken={authenticatedUserToken}
            >
                <DesktopCommandController
                    ref={ref}
                    onSelect={onSelect}
                    onAskAI={onAskAI}
                    setTheme={setTheme}
                    {...rest}
                />
            </FernDocsInstantSearch>
        );
    },
);

DesktopInstantSearch.displayName = "DesktopInstantSearch";
