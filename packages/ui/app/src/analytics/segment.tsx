import * as snippet from "@segment/snippet";
import Script from "next/script";
import { ReactNode } from "react";

export default function SegmentScript(props: snippet.Options): ReactNode {
    return (
        <Script id="segment" type="text/javascript" dangerouslySetInnerHTML={{ __html: renderSegmentSnippet(props) }} />
    );
}

function renderSegmentSnippet(opts: snippet.Options): string {
    if (process.env.NODE_ENV === "development") {
        return snippet.max(opts);
    }
    return snippet.min(opts);
}
