import { DocsV1Read } from "@fern-api/fdr-sdk";
import { isEqual } from "es-toolkit/predicate";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import dynamic from "next/dynamic";
import { ReactElement, memo } from "react";
import { DOCS_ATOM, DOMAIN_ATOM, DocsProps, EMPTY_ANALYTICS_CONFIG } from "../atoms";

declare global {
    interface Window {
        [key: string]: any;
    }
}

const AmplitudeScript = dynamic(() => import("./amplitude").then((mod) => mod.default), { ssr: true });
const ClearbitScript = dynamic(() => import("./clearbit").then((mod) => mod.default), { ssr: true });
const CustomerPosthogScript = dynamic(() => import("./posthog").then((mod) => mod.CustomerPosthog), { ssr: true });
const DatadogRumScript = dynamic(() => import("./datadog-rum").then((mod) => mod.default), { ssr: true });
const FathomScript = dynamic(() => import("./fathom").then((mod) => mod.FathomScript), { ssr: true });
const FullstoryScript = dynamic(() => import("./fullstory").then((mod) => mod.default), { ssr: true });
const GoogleAnalytics = dynamic(() => import("./ga").then((mod) => mod.default), {
    ssr: true,
});
const GoogleTagManager = dynamic(() => import("./gtm").then((mod) => mod.default), {
    ssr: true,
});
const HeapScript = dynamic(() => import("./heap").then((mod) => mod.default), { ssr: true });
const HotjarScript = dynamic(() => import("./hotjar").then((mod) => mod.default), { ssr: true });
const IntercomScript = dynamic(() => import("./intercom").then((mod) => mod.default), { ssr: true });
const KoalaScript = dynamic(() => import("./koala").then((mod) => mod.default), { ssr: true });
const LogRocketScript = dynamic(() => import("./logrocket").then((mod) => mod.default), { ssr: true });
const MixpanelScript = dynamic(() => import("./mixpanel").then((mod) => mod.default), { ssr: true });
const PirschScript = dynamic(() => import("./pirsch").then((mod) => mod.default), { ssr: true });
const PlausibleScript = dynamic(() => import("./plausible").then((mod) => mod.default), { ssr: true });
const PosthogScript = dynamic(() => import("./posthog").then((mod) => mod.default), { ssr: true });
const SegmentScript = dynamic(() => import("./segment").then((mod) => mod.default), { ssr: true });

const ANALYTICS_CONFIG_ATOM = selectAtom<DocsProps, DocsV1Read.AnalyticsConfig>(
    DOCS_ATOM,
    (docs) => docs.analyticsConfig ?? EMPTY_ANALYTICS_CONFIG,
    isEqual,
);

export const CustomerAnalytics = memo(function CustomerAnalytics(): ReactElement | null {
    const domain = useAtomValue(DOMAIN_ATOM);
    const config = useAtomValue(ANALYTICS_CONFIG_ATOM);

    return (
        <>
            {/* Always render posthog for internal analytics + optional customer */}
            <PosthogScript />

            {/* Additional analytics below are user-configured */}
            {config.amplitude && <AmplitudeScript apiKey={config.amplitude.apiKey} />}
            {config.clearbit && <ClearbitScript apiKey={config.clearbit.apiKey} />}
            {config.datadog && (
                <DatadogRumScript
                    applicationId={config.datadog.applicationId}
                    clientToken={config.datadog.clientToken}
                    site={config.datadog.site}
                />
            )}
            {config.fathom && <FathomScript siteId={config.fathom.siteId} />}
            {config.fullstory && <FullstoryScript orgId={config.fullstory.orgId} />}
            {config.ga4 && <GoogleAnalytics gaId={config.ga4.measurementId} />}
            {config.gtm && <GoogleTagManager gtmId={config.gtm.containerId} />}
            {config.heap && <HeapScript appId={config.heap.appId} />}
            {config.hotjar && <HotjarScript id={config.hotjar.hjid} version={config.hotjar.hjsv} />}
            {config.intercom && <IntercomScript app_id={config.intercom.appId} api_base={config.intercom.apiBase} />}
            {config.koala && <KoalaScript apiKey={config.koala.apiKey} />}
            {config.logrocket && <LogRocketScript appId={config.logrocket.apiKey} />}
            {config.mixpanel && <MixpanelScript token={config.mixpanel.apiKey} />}
            {config.pirsch && <PirschScript identificationCode={config.pirsch.id} />}
            {config.plausible && <PlausibleScript domain={config.plausible.domain} />}
            {config.posthog && (
                <CustomerPosthogScript token={config.posthog.apiKey} api_host={config.posthog.endpoint} />
            )}
            {config.segment && <SegmentScript apiKey={config.segment.writeKey} host={domain} />}
        </>
    );
});

export { track, trackInternal } from "./track";
