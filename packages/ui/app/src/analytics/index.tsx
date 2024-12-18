import { DocsV1Read } from "@fern-api/fdr-sdk";
import { isEqual } from "es-toolkit/predicate";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import dynamic from "next/dynamic";
import { ReactElement, memo } from "react";
import { DOCS_ATOM, DOMAIN_ATOM, DocsProps, EMPTY_ANALYTICS_CONFIG, FERN_USER_ATOM } from "../atoms";
import { Posthog } from "./PosthogContainer";

const IntercomScript = dynamic(() => import("./intercom").then((mod) => mod.default), { ssr: true });
const FullstoryScript = dynamic(() => import("./fullstory").then((mod) => mod.default), { ssr: true });
const GoogleAnalytics = dynamic(() => import("@next/third-parties/google").then((mod) => mod.GoogleAnalytics), {
    ssr: true,
});
const GoogleTagManager = dynamic(() => import("@next/third-parties/google").then((mod) => mod.GoogleTagManager), {
    ssr: true,
});
const SegmentScript = dynamic(() => import("./segment").then((mod) => mod.default), { ssr: true });
const AmplitudeScript = dynamic(() => import("./amplitude").then((mod) => mod.default), { ssr: true });
const MixpanelScript = dynamic(() => import("./mixpanel").then((mod) => mod.default), { ssr: true });
const HotjarScript = dynamic(() => import("./hotjar").then((mod) => mod.default), { ssr: true });
const KoalaScript = dynamic(() => import("./koala").then((mod) => mod.default), { ssr: true });
const LogRocketScript = dynamic(() => import("./logrocket").then((mod) => mod.default), { ssr: true });
const PirschScript = dynamic(() => import("./pirsch").then((mod) => mod.default), { ssr: true });
const PlausibleScript = dynamic(() => import("./plausible").then((mod) => mod.default), { ssr: true });
const FathomScript = dynamic(() => import("./fathom").then((mod) => mod.FathomScript), { ssr: true });
const ClearbitScript = dynamic(() => import("./clearbit").then((mod) => mod.default), { ssr: true });
const HeapScript = dynamic(() => import("./heap").then((mod) => mod.default), { ssr: true });
const DatadogRumScript = dynamic(() => import("./datadog-rum").then((mod) => mod.default), { ssr: true });

const ANALYTICS_CONFIG_ATOM = selectAtom<DocsProps, DocsV1Read.AnalyticsConfig>(
    DOCS_ATOM,
    (docs) => docs.analyticsConfig ?? EMPTY_ANALYTICS_CONFIG,
    isEqual,
);

export const CustomerAnalytics = memo(function CustomerAnalytics(): ReactElement | null {
    const domain = useAtomValue(DOMAIN_ATOM);
    const config = useAtomValue(ANALYTICS_CONFIG_ATOM);
    const user = useAtomValue(FERN_USER_ATOM);

    return (
        <>
            {/* Always render posthog for internal analytics + optional customer */}
            <Posthog customerConfig={config.posthog} />
            {/* Additional analytics below are user-configured */}
            {config.segment && <SegmentScript apiKey={config.segment.writeKey} host={domain} />}
            {config.fullstory && <FullstoryScript orgId={config.fullstory.orgId} />}
            {config.intercom && (
                <IntercomScript
                    app_id={config.intercom.appId}
                    api_base={config.intercom.apiBase}
                    email={user?.email}
                    name={user?.name}
                />
            )}
            {config.gtm && <GoogleTagManager gtmId={config.gtm.containerId} />}
            {config.ga4 && <GoogleAnalytics gaId={config.ga4.measurementId} />}
            {config.amplitude && <AmplitudeScript apiKey={config.amplitude.apiKey} />}
            {config.mixpanel && <MixpanelScript token={config.mixpanel.apiKey} />}
            {config.hotjar && <HotjarScript id={config.hotjar.hjid} version={config.hotjar.hjsv} />}
            {config.koala && <KoalaScript apiKey={config.koala.apiKey} />}
            {config.logrocket && <LogRocketScript appId={config.logrocket.apiKey} />}
            {config.pirsch && <PirschScript identificationCode={config.pirsch.id} />}
            {config.plausible && <PlausibleScript domain={config.plausible.domain} />}
            {config.fathom && <FathomScript siteId={config.fathom.siteId} />}
            {config.clearbit && <ClearbitScript apiKey={config.clearbit.apiKey} />}
            {config.heap && <HeapScript appId={config.heap.appId} />}
            {config.datadog && (
                <DatadogRumScript
                    applicationId={config.datadog.applicationId}
                    clientToken={config.datadog.clientToken}
                    site={config.datadog.site}
                />
            )}
        </>
    );
});
