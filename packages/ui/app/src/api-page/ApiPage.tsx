import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export declare namespace ApiPage {
    export interface Props {
        marginHorizontal?: number;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({ marginHorizontal }) => {
    const { apiDefinition, apiSlug, apiSection } = useApiDefinitionContext();

    return (
        <div
            className="min-h-0 overflow-y-auto overflow-x-hidden pb-36"
            style={{
                paddingRight: marginHorizontal,
                marginRight: marginHorizontal,
            }}
        >
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <ApiArtifacts apiArtifacts={apiSection.artifacts} />
            )}
            <ApiPackageContents package={apiDefinition.rootPackage} slug={apiSlug} isLastInParentPackage={false} />

            <div className="pl-6 pr-4 md:pl-12">
                <BottomNavigationButtons />
            </div>
        </div>
    );
};
