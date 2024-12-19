import Script from "next/script";
import { ReactNode } from "react";

// TODO: send events to clearbit
export function ClearbitScript({ apiKey }: { apiKey: string }): ReactNode {
    return (
        <Script
            id="clearbit"
            src={`https://tag.clearbitscripts.com/v1/${apiKey}/tags.js`}
            referrerPolicy="strict-origin-when-cross-origin"
        />
    );
}
