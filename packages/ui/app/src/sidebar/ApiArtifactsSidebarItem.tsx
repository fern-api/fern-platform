import { ApiArtifactsTitle } from "../api-page/artifacts/ApiArtifactsTitle";
import { SidebarItem } from "./SidebarItem";

export declare namespace ApiArtifactsSidebarItem {
    export interface Props {
        slug: string;
    }
}

export const ApiArtifactsSidebarItem: React.FC<ApiArtifactsSidebarItem.Props> = ({ slug }) => {
    return <SidebarItem slug={slug} title={<ApiArtifactsTitle />} />;
};
