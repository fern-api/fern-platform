import { track } from "@/client/analytics";
import Error from "next/error";
import { ReactElement, useEffect } from "react";

/**
 * This is required for Next.js to generate `_next/static/chunks/pages/404.js`
 * Which helps prevent a client-side error to be thrown when navigating to a non-existent page
 */

// NOTE: do not add initial props (SSG or SSR) here or else it will break.
// The middleware is unable to rewrite to the NextData page route, so it always returns {}.
// If you use initial props, the middleware's response will probably cause a client-side error to be thrown.
export default function Page(): ReactElement {
  useEffect(() => {
    track("not_found");
  });

  return <Error statusCode={404} />;
}
