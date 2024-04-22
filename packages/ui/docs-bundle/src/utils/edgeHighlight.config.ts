import { EdgeHighlight } from "@highlight-run/next/server";
import { NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID, NEXT_PUBLIC_HIGHLIGHT_SERVICE_NAME } from "../constants";

export const withEdgeHighlight = EdgeHighlight({
    projectID: NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
    serviceName: NEXT_PUBLIC_HIGHLIGHT_SERVICE_NAME,
});
