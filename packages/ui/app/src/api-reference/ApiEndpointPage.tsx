import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { ApiPageContext } from "../contexts/api-page";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { SingleApiPageContent, type ApiPage } from "./SingleApiPageContent";

export declare namespace ApiEndpointPage {
    export interface Props {
        item: ApiPage.Item;
        showErrors: boolean;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }
}

export const ApiEndpointPage: React.FC<ApiEndpointPage.Props> = ({ item, showErrors, types }) => {
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
