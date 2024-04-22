import { PageRouterHighlight } from "@highlight-run/next/server";
import { NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID } from "../constants";

export const withPageRouterHighlight = PageRouterHighlight({
    projectID: NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
});
