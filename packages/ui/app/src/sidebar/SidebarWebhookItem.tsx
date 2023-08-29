import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace SidebarWebhookItem {
    export interface Props {
        slug: string;
        webhook: FernRegistryApiRead.WebhookDefinition;
    }
}

export const SidebarWebhookItem: React.FC<SidebarWebhookItem.Props> = ({ slug, webhook }) => {
    return <NavigatingSidebarItem slug={slug} title={webhook.name ?? ""} />;
};
