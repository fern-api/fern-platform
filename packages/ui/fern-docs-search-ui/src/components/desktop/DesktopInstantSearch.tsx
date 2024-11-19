import "instantsearch.css/themes/reset.css";
import { useTheme } from "next-themes";
import { type ReactElement } from "react";
import { FernDocsInstantSearch } from "../shared/FernDocsInstantSearch";
import { DesktopCommandController } from "./DesktopCommandController";

interface DesktopInstantSearchProps {
    onSelect: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    initialFilters?: {
        "product.title"?: string;
        "version.title"?: string;
    };
    userToken?: string;
    authenticatedUserToken?: string;
    accentBackgroundColor?: string;
    accentForegroundColor?: string;
    accentBackgroundColorDark?: string;
    accentForegroundColorDark?: string;
}

export function DesktopInstantSearch({
    onSelect,
    onAskAI,
    initialFilters,
    userToken,
    authenticatedUserToken,
    accentBackgroundColor,
    accentForegroundColor,
    accentBackgroundColorDark,
    accentForegroundColorDark,
}: DesktopInstantSearchProps): ReactElement {
    const { setTheme } = useTheme();

    return (
        <FernDocsInstantSearch
            initialFilters={initialFilters}
            userToken={userToken}
            authenticatedUserToken={authenticatedUserToken}
        >
            <DesktopCommandController
                onSelect={onSelect}
                onAskAI={onAskAI}
                setTheme={setTheme}
                style={
                    {
                        "--accent-background-color": accentBackgroundColor,
                        "--accent-foreground-color": accentForegroundColor,
                        "--accent-background-color-dark": accentBackgroundColorDark,
                        "--accent-foreground-color-dark": accentForegroundColorDark,
                    } as React.CSSProperties
                }
            />
        </FernDocsInstantSearch>
    );
}
