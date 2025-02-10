import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";

import type { NavigationNodePage, PageId } from ".";

const RETURN_PAGEID = (node: { pageId: PageId }) => node.pageId;
const RETURN_OVERVIEW_PAGEID = (node: { overviewPageId?: PageId }) =>
  node.overviewPageId;
const RETURN_UNDEFINED = () => undefined;

export function getPageId(node: NavigationNodePage): PageId | undefined {
  return visitDiscriminatedUnion(node)._visit({
    section: RETURN_OVERVIEW_PAGEID,
    apiReference: RETURN_OVERVIEW_PAGEID,
    changelog: RETURN_OVERVIEW_PAGEID,
    apiPackage: RETURN_OVERVIEW_PAGEID,
    changelogEntry: RETURN_PAGEID,
    page: RETURN_PAGEID,
    landingPage: RETURN_PAGEID,

    // if the following changes, make sure to update the algolia records generator
    endpoint: RETURN_UNDEFINED,
    webSocket: RETURN_UNDEFINED,
    webhook: RETURN_UNDEFINED,
    // changelogYear: RETURN_UNDEFINED,
    // changelogMonth: RETURN_UNDEFINED,
  });
}
