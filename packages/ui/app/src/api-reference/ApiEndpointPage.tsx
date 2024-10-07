import { useSetAtom } from "jotai";
import { ALL_ENVIRONMENTS_ATOM } from "../atoms/environment";
import { ApiPageContext } from "../contexts/api-page";
import type { ResolvedApiEndpoint, ResolvedTypeDefinition } from "../resolver/types";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { SingleApiPageContent } from "./SingleApiPageContent";

export declare namespace ApiEndpointPage {
    export interface Props {
        item: ResolvedApiEndpoint;
        showErrors: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const ApiEndpointPage: React.FC<ApiEndpointPage.Props> = ({ item, showErrors, types }) => {
    const setEnvironmentIds = useSetAtom(ALL_ENVIRONMENTS_ATOM);
    if (item.type === "endpoint" || item.type === "websocket") {
        setEnvironmentIds(item.environments.map((env) => env.id));
    }

    return (
        <ApiPageContext.Provider value={true}>
            <SingleApiPageContent item={item} showErrors={showErrors} types={types} />
            {/* <div className="px-4 md:px-6 lg:px-8">
                <BottomNavigationNeighbors />
            </div> */}
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
