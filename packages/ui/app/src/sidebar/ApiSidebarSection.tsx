import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { API_ARTIFACTS_TITLE } from "../config";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { NonClickableSidebarGroupTitle } from "./NonClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";

export declare namespace ApiSidebarSection {
    export interface Props {
        slug: string;
    }
}

export const ApiSidebarSection: React.FC<ApiSidebarSection.Props> = ({ slug }) => {
    const { apiSection, apiDefinition } = useApiDefinitionContext();
    const { selectedSlug } = useDocsContext();

    return (
        <SidebarGroup title={<NonClickableSidebarGroupTitle title={apiSection.title} />} includeTopMargin>
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <SidebarItem slug={joinUrlSlugs(slug, "client-libraries")} title={API_ARTIFACTS_TITLE} />
            )}
            <ApiPackageSidebarSectionContents
                package={apiDefinition.rootPackage}
                slug={slug}
                shallow={selectedSlug?.includes(slug) ?? false}
            />
        </SidebarGroup>
    );
};
