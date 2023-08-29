import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { SidebarItem } from "./SidebarItem";

export declare namespace SidebarPageItem {
    export interface Props {
        slug: string;
        pageMetadata: FernRegistryDocsRead.PageMetadata;
    }
}

export const SidebarPageItem: React.FC<SidebarPageItem.Props> = ({ slug, pageMetadata }) => {
    return <SidebarItem slug={slug} title={pageMetadata.title} />;
};
