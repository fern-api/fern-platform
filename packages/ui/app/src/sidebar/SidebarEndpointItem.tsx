import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { EndpointTitle } from "../api-page/endpoints/EndpointTitle";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace SidebarEndpointItem {
    export interface Props {
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const SidebarEndpointItem: React.FC<SidebarEndpointItem.Props> = ({ slug, endpoint }) => {
    return <NavigatingSidebarItem slug={slug} title={<EndpointTitle endpoint={endpoint} />} />;
};
