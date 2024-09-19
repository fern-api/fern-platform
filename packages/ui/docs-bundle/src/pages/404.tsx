import Error from "next/error";
import { ReactElement } from "react";

/**
 * This is required for Next.js to generate `_next/static/chunks/pages/404.js`
 * Which helps prevent a client-side error to be thrown when navigating to a non-existent page
 */
export default function Page(): ReactElement {
    return <Error statusCode={404} />;
}
