import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { HttpMethodIcon } from "../commons/HttpMethodIcon";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace WebhookSidebarItem {
    export interface Props {
        slug: string;
        webhook: FernRegistryApiRead.WebhookDefinition;
    }
}

export const WebhookSidebarItem: React.FC<WebhookSidebarItem.Props> = ({ slug, webhook }) => {
    return <NavigatingSidebarItem slug={slug} title={webhook.name ?? ""} leftElement={<HttpMethodIcon />} />;
};
