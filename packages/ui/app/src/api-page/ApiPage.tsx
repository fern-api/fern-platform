import { ResolvedNavigationItemApiSection } from "@fern-ui/app-utils";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";

export declare namespace ApiPage {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        maxContentWidth: string;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({ apiSection, maxContentWidth }) => {
    return (
        <div className="min-h-0">
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <ApiArtifacts apiArtifacts={apiSection.artifacts} apiDefinition={apiSection} />
            )}

            <ApiPackageContents
                apiSection={apiSection}
                apiDefinition={apiSection}
                isLastInParentPackage={false}
                anchorIdParts={[]}
                maxContentWidth={maxContentWidth}
            />

            <div className="mx-3 mb-3 rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] py-8 pl-6 pr-4 md:pl-12 lg:ml-0">
                <div style={{ maxWidth: maxContentWidth }}>
                    <BottomNavigationButtons hideLine={true} />
                </div>
            </div>
        </div>
    );
};
