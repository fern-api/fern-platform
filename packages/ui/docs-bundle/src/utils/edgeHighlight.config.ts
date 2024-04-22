import { EdgeHighlight } from "@highlight-run/next/server";
import { NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID } from "../constants";

export const withEdgeHighlight = EdgeHighlight({
    projectID: NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
});
