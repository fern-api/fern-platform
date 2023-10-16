import { FocusStyleManager } from "@blueprintjs/core";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import classNames from "classnames";
import { ApiDefinitionContextProvider } from "./api-context/ApiDefinitionContextProvider";
import styles from "./App.module.scss";
import { DocsContextProvider } from "./docs-context/DocsContextProvider";
import { Playground } from "./playground/Playground";
import { type ResolvedPath } from "./ResolvedPath";

FocusStyleManager.onlyShowFocusOnTabs();

export declare namespace PlaygroundApp {
    export interface Props {
        docs: FernRegistryDocsRead.LoadDocsForUrlResponse;
        resolvedPath: ResolvedPath.ApiPage;
    }
}

export const PlaygroundApp: React.FC<PlaygroundApp.Props> = ({ docs, resolvedPath }) => {
    return (
        <div className={classNames(styles.app, "h-screen")}>
            <DocsContextProvider docsDefinition={docs.definition}>
                <ApiDefinitionContextProvider apiSection={resolvedPath.apiSection}>
                    <Playground fullSlug={resolvedPath.fullSlug} />
                </ApiDefinitionContextProvider>
            </DocsContextProvider>
        </div>
    );
};
