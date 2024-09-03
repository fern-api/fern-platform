import { BottomNavigationButtons } from "../components/BottomNavigationButtons";
import { ApiPageContext } from "../contexts/api-page";
import { ResolvedApiDefinitionItem, ResolvedTypeDefinition } from "../resolver/types";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";
import { SingleApiPageContent } from "./SingleApiPageContent";

export declare namespace ApiDefinitionPage {
    export interface Props {
        item: ResolvedApiDefinitionItem;
        showErrors: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const ApiDefinitionPage: React.FC<ApiDefinitionPage.Props> = ({ item, showErrors, types }) => {
    return (
        <ApiPageContext.Provider value={true}>
            <SingleApiPageContent item={item} showErrors={showErrors} types={types} />
            <div className="px-4 md:px-6 lg:px-8">
                <BottomNavigationButtons showPrev />
            </div>
            <BuiltWithFern className="w-fit mx-auto my-8" />
        </ApiPageContext.Provider>
    );
};
