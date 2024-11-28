import { FacetName } from "@/utils/facet-display";
import "instantsearch.css/themes/reset.css";
import { forwardRef } from "react";
import { Components } from "react-markdown";
import { FernDocsInstantSearch } from "../shared/fern-docs-instant-search";
import { DesktopCommand, DesktopCommandSharedProps } from "./desktop-command";

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

    /**
     * Headers to send to the ask ai api
     */
    headers?: Record<string, string>;

    /**
     * Custom components for the search results
     */
    components?: Components;

    /**
     * System context for the AI Ask feature
     */
    systemContext?: Record<string, string>;
}

export const DesktopInstantSearch = forwardRef<HTMLDivElement, DesktopInstantSearchProps & DesktopCommandSharedProps>(
    (props, ref) => {
        const { initialFilters, userToken, authenticatedUserToken, ...rest } = props;
        return (
            <FernDocsInstantSearch
                initialFilters={initialFilters}
                userToken={userToken}
                authenticatedUserToken={authenticatedUserToken}
            >
                <DesktopCommand ref={ref} {...rest} />
            </FernDocsInstantSearch>
        );
    },
);

DesktopInstantSearch.displayName = "DesktopInstantSearch";
