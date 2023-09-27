import classNames from "classnames";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useHashContext } from "../hash-context/useHashContext";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export declare namespace ApiPage {
    export interface Props {}
}

export const ApiPage: React.FC<ApiPage.Props> = () => {
    const { hashInfo } = useHashContext();
    const { apiDefinition, apiSlug, apiSection } = useApiDefinitionContext();

    return (
        <div
            className={classNames("min-h-0 pb-36", {
                "opacity-0": hashInfo.status === "loading" || hashInfo.status === "navigating",
            })}
        >
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <ApiArtifacts apiArtifacts={apiSection.artifacts} />
            )}
            <ApiPackageContents
                package={apiDefinition.rootPackage}
                slug={apiSlug}
                isLastInParentPackage={false}
                anchorIdParts={[]}
            />

            <div className="pl-6 pr-4 md:pl-12">
                <BottomNavigationButtons />
            </div>
        </div>
    );
};
