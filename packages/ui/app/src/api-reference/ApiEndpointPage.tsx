import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { WRITE_API_DEFINITION_ATOM } from "../atoms";
import { ALL_ENVIRONMENTS_ATOM } from "../atoms/environment";
import { ApiPageContext } from "../contexts/api-page";
import { DocsContent } from "../resolver/DocsContent";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { SingleApiPageContent } from "./SingleApiPageContent";

export declare namespace ApiEndpointPage {
    export interface Props {
        content: DocsContent.ApiEndpointPage;
    }
}

export const ApiEndpointPage: React.FC<ApiEndpointPage.Props> = ({ content }) => {
    const set = useSetAtom(WRITE_API_DEFINITION_ATOM);
    set(content.apiDefinition);

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

    return (
        <ApiPageContext.Provider value={true}>
            <SingleApiPageContent content={content} />
            {/* TODO: make this visible only in mobile */}
            {/* <div className="px-4 md:px-6 lg:px-8">
                <BottomNavigationNeighbors />
            </div> */}
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
