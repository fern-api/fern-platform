import { ResolvedNavigationItemApiSection } from "@fern-ui/app-utils";
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
                isLastInParentPackage={false}
                anchorIdParts={[]}
            />

            <div className="pl-6 pr-4 md:pl-12">{/* <BottomNavigationButtons /> */}</div>
        </div>
    );
};
