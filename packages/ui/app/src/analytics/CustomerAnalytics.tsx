import { GoogleAnalytics } from "@next/third-parties/google";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import dynamic from "next/dynamic";
import Script from "next/script";
import { ReactElement, memo } from "react";
import { DOCS_ATOM, DOMAIN_ATOM } from "../atoms";
import { GoogleTagManager } from "./GoogleTagManager";
import { useInitializePosthog } from "./posthog";
import { renderSegmentSnippet } from "./segment";

const IntercomScript = dynamic(() => import("./IntercomScript").then((mod) => mod.IntercomScript));
const FullstoryScript = dynamic(() => import("./FullstoryScript").then((mod) => mod.FullstoryScript));

const ANALYTICS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.analytics ?? {}, isEqual);
const ANALYTICS_CONFIG_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.analyticsConfig ?? {}, isEqual);

export const CustomerAnalytics = memo(function CustomerAnalytics(): ReactElement | null {
    const domain = useAtomValue(DOMAIN_ATOM);
    const { ga4, gtm } = useAtomValue(ANALYTICS_ATOM);
    const config = useAtomValue(ANALYTICS_CONFIG_ATOM);
    useInitializePosthog(config.posthog);

    return (
        <>
            {/* renders either segment with our write key or segment with the customer's write key */}
            <Script
                id="segment-script"
                dangerouslySetInnerHTML={{
                    __html: renderSegmentSnippet(domain, config.segment?.writeKey),
                }}
            />
            <IntercomScript config={config.intercom} />
            <FullstoryScript config={config.fullstory} />
            {ga4 != null && <GoogleAnalytics gaId={ga4.measurementId} />}
            {gtm != null && <GoogleTagManager {...gtm} />}
        </>
    );
});
