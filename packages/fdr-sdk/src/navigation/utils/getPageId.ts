import { visitDiscriminatedUnion } from "../../utils";
import { FernNavigation } from "../generated";
import { NavigationNodePage } from "../types";

const RETURN_PAGEID = (node: { pageId: FernNavigation.PageId }) => node.pageId;
const RETURN_OVERVIEW_PAGEID = (node: { overviewPageId?: FernNavigation.PageId }) => node.overviewPageId;
const RETURN_UNDEFINED = () => undefined;

export function getPageId(node: NavigationNodePage): FernNavigation.PageId | undefined {
    return visitDiscriminatedUnion(node)._visit({
        section: RETURN_OVERVIEW_PAGEID,
        apiReference: RETURN_OVERVIEW_PAGEID,
        changelog: RETURN_OVERVIEW_PAGEID,
        apiPackage: RETURN_OVERVIEW_PAGEID,
        changelogEntry: RETURN_PAGEID,
        page: RETURN_PAGEID,

        // if the following changes, make sure to update the algolia records generator
        endpoint: RETURN_UNDEFINED,
        webSocket: RETURN_UNDEFINED,
        webhook: RETURN_UNDEFINED,
        changelogYear: RETURN_UNDEFINED,
        changelogMonth: RETURN_UNDEFINED,
    });
}
