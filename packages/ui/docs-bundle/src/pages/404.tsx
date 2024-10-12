import Error from "next/error";
import { ReactElement, useEffect } from "react";
import { capturePosthogEvent } from "../../../app/src/analytics/posthog";

/**
 * This is required for Next.js to generate `_next/static/chunks/pages/404.js`
 * Which helps prevent a client-side error to be thrown when navigating to a non-existent page
 */
export default function Page(): ReactElement {
    useEffect(() => {
        capturePosthogEvent("not_found");
    });

    return <Error statusCode={404} />;
}
