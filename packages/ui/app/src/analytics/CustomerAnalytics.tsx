import { GoogleAnalytics } from "@next/third-parties/google";
import { ReactElement } from "react";
import { GoogleTagManager } from "./GoogleTagManager";
import { type CustomerAnalytics } from "./types";

export function CustomerAnalytics({ ga4, gtm }: CustomerAnalytics): ReactElement | null {
    return (
        <>
            {ga4 != null && <GoogleAnalytics gaId={ga4.measurementId} />}
            {gtm != null && <GoogleTagManager {...gtm} />}
        </>
    );
}
