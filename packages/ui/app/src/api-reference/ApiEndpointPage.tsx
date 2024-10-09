import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { WRITE_API_DEFINITION_ATOM, useNavigationNodes } from "../atoms";
import { ALL_ENVIRONMENTS_ATOM } from "../atoms/environment";
import { BottomNavigationNeighbors } from "../components/BottomNavigationNeighbors";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { ApiPageContext } from "../contexts/api-page";
import { DocsContent } from "../resolver/DocsContent";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { ApiPackageContent, isApiPackageContentNode } from "./ApiPackageContent";

export declare namespace ApiEndpointPage {
    export interface Props {
        content: DocsContent.ApiEndpointPage;
    }
}

export const ApiEndpointPage: React.FC<ApiEndpointPage.Props> = ({ content }) => {
    const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
    useEffect(() => set(content.apiDefinition), [content.apiDefinition, set]);

    // TODO: Why are we doing this here?
    const setEnvironmentIds = useSetAtom(ALL_ENVIRONMENTS_ATOM);
    useEffect(() => {
        const ids: FernNavigation.EnvironmentId[] = [];
        Object.values(content.apiDefinition.endpoints).forEach((endpoint) => {
            endpoint.environments?.forEach((env) => {
                ids.push(env.id);
            });
        });
        Object.values(content.apiDefinition.websockets).forEach((endpoint) => {
            endpoint.environments?.forEach((env) => {
                ids.push(env.id);
            });
        });
    }, [content.apiDefinition.endpoints, content.apiDefinition.websockets, setEnvironmentIds]);

    const node = useNavigationNodes().get(content.nodeId);
    if (!node || !isApiPackageContentNode(node)) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Expected node to be an api reference node");
        return null;
    }

    return (
        <ApiPageContext.Provider value={true}>
            <FernErrorBoundary component="ApiEndpointPage">
                <ApiPackageContent
                    node={node}
                    apiDefinition={content.apiDefinition}
                    breadcrumb={content.breadcrumb}
                    mdxs={EMPTY_OBJECT}
                    showErrors={content.showErrors}
                />
            </FernErrorBoundary>
            <div className="px-4 md:px-6 lg:px-8 lg:hidden">
                <BottomNavigationNeighbors />
            </div>
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
