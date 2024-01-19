import { FocusStyleManager } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/datetime2/lib/css/blueprint-datetime2.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { DocsV2Read } from "@fern-api/fdr-sdk";
import type { ResolvedPath } from "@fern-ui/app-utils";
import "@fontsource/ibm-plex-mono";
import "normalize.css";
import { useEffect } from "react";
import { initializePosthog } from "./analytics/posthog";
import { CONTEXTS } from "./contexts";
import { DocsContextProvider } from "./docs-context/DocsContextProvider";
import { Docs } from "./docs/Docs";
import { NavigationContextProvider } from "./navigation-context/NavigationContextProvider";

FocusStyleManager.onlyShowFocusOnTabs();

export declare namespace App {
    export interface Props {
        docs: DocsV2Read.LoadDocsForUrlResponse;
        resolvedPath: ResolvedPath;
    }
}

export const App: React.FC<App.Props> = ({ docs, resolvedPath }) => {
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_POSTHOG_API_KEY != null && process.env.NEXT_PUBLIC_POSTHOG_API_KEY.length > 0) {
            initializePosthog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY);
        }
    }, []);

    return (
        <div className="flex h-screen flex-1">
            <div className="w-full">
                {CONTEXTS.reduceRight(
                    (children, Context) => (
                        <Context>{children}</Context>
                    ),
                    <DocsContextProvider docsDefinition={docs.definition} baseUrl={docs.baseUrl}>
                        <NavigationContextProvider resolvedPath={resolvedPath} basePath={docs.baseUrl.basePath}>
                            <Docs />
                        </NavigationContextProvider>
                    </DocsContextProvider>
                )}
            </div>
        </div>
    );
};
