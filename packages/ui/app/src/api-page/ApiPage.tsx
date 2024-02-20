import { ResolvedNavigationItemApiSection } from "../util/resolver";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export declare namespace ApiPage {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({ apiSection }) => {
    return (
        <div className="min-h-0 pb-36">
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <ApiArtifacts apiArtifacts={apiSection.artifacts} apiDefinition={apiSection} />
            )}

            <ApiPackageContents
                apiSection={apiSection}
                apiDefinition={apiSection}
                isLastInParentPackage={true}
                anchorIdParts={[]}
            />

            <div className="px-4">{/* <BottomNavigationButtons /> */}</div>
        </div>
    );
};
