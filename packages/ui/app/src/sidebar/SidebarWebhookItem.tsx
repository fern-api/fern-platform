import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { SidebarItem } from "./SidebarItem";

export declare namespace SidebarWebhookItem {
    export interface Props {
        slug: string;
        webhook: FernRegistryApiRead.WebhookDefinition;
    }
}

export const SidebarWebhookItem: React.FC<SidebarWebhookItem.Props> = ({ slug, webhook }) => {
    return <SidebarItem slug={slug} title={webhook.name ?? ""} />;
};
