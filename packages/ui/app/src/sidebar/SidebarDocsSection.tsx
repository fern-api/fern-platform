import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useState } from "react";
import { ClickableSidebarGroupTitle } from "./ClickableSidebarGroupTitle";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItems } from "./SidebarItems";

export declare namespace SidebarDocsSection {
    export interface Props {
        slug: string;
        section: FernRegistryDocsRead.DocsSection;
    }
}

export const SidebarDocsSection: React.FC<SidebarDocsSection.Props> = ({ slug, section }) => {
    const [collapsed, setCollapsed] = useState(section.title === "Changelog");

    return (
        <SidebarGroup
            title={
                <ClickableSidebarGroupTitle
                    onClick={() => setCollapsed((v) => !v)}
                    collapsed={collapsed}
                    title={section.title}
                />
            }
            includeTopMargin
        >
            {!collapsed && <SidebarItems slug={slug} navigationItems={section.items} />}
        </SidebarGroup>
    );
};
