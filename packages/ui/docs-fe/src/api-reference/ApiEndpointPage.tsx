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
    return (
        <ApiPageContext.Provider value={true}>
            <SingleApiPageContent item={item} showErrors={showErrors} types={types} />
            {/* <div className="px-4 md:px-6 lg:px-8">
                <BottomNavigationNeighbors />
            </div> */}
            <BuiltWithFern className="mx-auto my-8 w-fit" />
        </ApiPageContext.Provider>
    );
};
