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
        <div className="min-h-0 pb-36">
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

            <div className="pl-6 pr-4 md:pl-12" style={{ maxWidth: maxContentWidth }}>
                <BottomNavigationButtons />
            </div>
        </div>
    );
};
