import { GoogleAnalytics } from "@next/third-parties/google";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import Script from "next/script";
import { ReactElement, memo } from "react";
import { DOCS_ATOM, DOMAIN_ATOM } from "../atoms";
import { useFullstoryInitializer } from "./fullstory";
import { GoogleTagManager } from "./GoogleTagManager";
import { IntercomScript } from "./IntercomScript";
import { renderSegmentSnippet } from "./segment";

const ANALYTICS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.analytics ?? {}, isEqual);
const ANALYTICS_CONFIG_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.analyticsConfig ?? {}, isEqual);

export const CustomerAnalytics = memo(function CustomerAnalytics(): ReactElement | null {
    const domain = useAtomValue(DOMAIN_ATOM);
    const { ga4, gtm } = useAtomValue(ANALYTICS_ATOM);
    const config = useAtomValue(ANALYTICS_CONFIG_ATOM);

    // useIntercomInitializer(config.intercom);
    useFullstoryInitializer(config.fullstory);

    return (
        <>
            {/* renders either segment with our write key or segment with the customer's write key */}
            <Script
                id="segment-script"
                dangerouslySetInnerHTML={{
                    __html: renderSegmentSnippet(domain, config.segment?.writeKey),
                }}
            />
            <IntercomScript config={config.intercom ?? { appId: "augd8ye6" }} />
            {ga4 != null && <GoogleAnalytics gaId={ga4.measurementId} />}
            {gtm != null && <GoogleTagManager {...gtm} />}
        </>
    );
});
