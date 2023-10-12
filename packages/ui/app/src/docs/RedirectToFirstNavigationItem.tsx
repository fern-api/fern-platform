import { NonIdealState } from "@blueprintjs/core";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { assertNeverNoThrow } from "@fern-ui/core-utils";
import { Redirect } from "./Redirect";

export declare namespace RedirectToFirstNavigationItem {
    export interface Props {
        items: FernRegistryDocsRead.NavigationItem[];
        slug: string;
    }
}

export const RedirectToFirstNavigationItem: React.FC<RedirectToFirstNavigationItem.Props> = ({ items, slug }) => {
    const firstItem = items[0];
    if (firstItem != null) {
        switch (firstItem.type) {
            case "page":
            case "api":
                return <Redirect to={joinUrlSlugs(slug, firstItem.urlSlug)} replace />;
            case "section":
                return (
                    <RedirectToFirstNavigationItem
                        items={firstItem.items}
                        slug={joinUrlSlugs(slug, firstItem.urlSlug)}
                    />
                );
            default:
                assertNeverNoThrow(firstItem);
        }
    }
    return <NonIdealState title="No content" />;
};
