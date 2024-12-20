import type { DocsV1Read } from "@fern-api/fdr-sdk";
import dynamic from "next/dynamic";
import { memo } from "react";
import { UserInfo, UserInfoProvider } from "./user";

// const Amplitude = dynamic(() => import("./amplitude"), { ssr: true });
// const Clearbit = dynamic(() => import("./clearbit"), { ssr: true });
const CustomerPosthog = dynamic(() => import("./posthog-customer"), { ssr: true });
// const DatadogRum = dynamic(() => import("./datadog-rum"), { ssr: true });
// const Fathom = dynamic(() => import("./fathom"), { ssr: true });
// const Fullstory = dynamic(() => import("./fullstory"), { ssr: true });
const GoogleAnalytics = dynamic(() => import("./ga"), { ssr: true });
const GoogleTagManager = dynamic(() => import("./gtm"), { ssr: true });
// const Heap = dynamic(() => import("./heap"), { ssr: true });
// const Hotjar = dynamic(() => import("./hotjar"), { ssr: true });
// const Intercom = dynamic(() => import("./intercom"), { ssr: true });
// const Koala = dynamic(() => import("./koala"), { ssr: true });
// const LogRocket = dynamic(() => import("./logrocket"), { ssr: true });
// const Mixpanel = dynamic(() => import("./mixpanel"), { ssr: true });
// const Pirsch = dynamic(() => import("./pirsch"), { ssr: true });
// const Plausible = dynamic(() => import("./plausible"), { ssr: true });
const Posthog = dynamic(() => import("./posthog-internal"), { ssr: true });
const Segment = dynamic(() => import("./segment"), { ssr: true });

export const CustomerAnalytics = memo(function CustomerAnalytics(
    props: DocsV1Read.AnalyticsConfig &
        UserInfo & {
            posthogRoute: string;
        },
) {
    return (
        <UserInfoProvider email={props.email} name={props.name}>
            {/* Always render posthog for internal analytics + optional customer */}
            <Posthog route={props.posthogRoute} />

            {/* Additional analytics below are user-configured */}
            {/* {props.amplitude && <Amplitude apiKey={props.amplitude.apiKey} />} */}
            {/* {props.clearbit && <Clearbit apiKey={props.clearbit.apiKey} />} */}
            {/* {props.datadog && (
                <DatadogRum
                    applicationId={props.datadog.applicationId}
                    clientToken={props.datadog.clientToken}
                    site={props.datadog.site}
                />
            )} */}
            {/* {props.fathom && <Fathom siteId={props.fathom.siteId} />}
            {props.fullstory && <Fullstory orgId={props.fullstory.orgId} />} */}
            {props.ga4 && <GoogleAnalytics gaId={props.ga4.measurementId} />}
            {props.gtm && <GoogleTagManager gtmId={props.gtm.containerId} />}
            {/* {props.heap && <Heap appId={props.heap.appId} />}
            {props.hotjar && <Hotjar id={props.hotjar.hjid} version={props.hotjar.hjsv} />}
            {props.intercom && <Intercom app_id={props.intercom.appId} api_base={props.intercom.apiBase} />}
            {props.koala && <Koala apiKey={props.koala.apiKey} />}
            {props.logrocket && <LogRocket appId={props.logrocket.apiKey} />}
            {props.mixpanel && <Mixpanel token={props.mixpanel.apiKey} />}
            {props.pirsch && <Pirsch identificationCode={props.pirsch.id} />}
            {props.plausible && <Plausible domain={props.plausible.domain} />} */}
            {props.posthog && <CustomerPosthog token={props.posthog.apiKey} api_host={props.posthog.endpoint} />}
            {props.segment && <Segment apiKey={props.segment.writeKey} />}
        </UserInfoProvider>
    );
});
