import { DocsV1Read } from "@fern-api/fdr-sdk";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { ReactElement } from "react";
import { IntercomIntegration } from "./IntercomIntegration";

interface Analytics {
    ga4?: {
        id: string;
        dataLayerName?: string;
    };
    gtm?: {
        id: string;
        dataLayer?: string[];
        dataLayerName?: string;
        auth?: string;
        preview?: string;
    };
}

const CUSTOMER_ANALYTICS: Record<string, Analytics> = {
    devrev: {
        gtm: {
            id: "GTM-P859DNW4",
        },
    },
};

interface CustomerIntegrationsProps {
    domain: string;
    integrations: DocsV1Read.IntegrationsConfig | undefined;
}

export function CustomerIntegrations({ domain, integrations }: CustomerIntegrationsProps): ReactElement | null {
    const analytics = Object.entries(CUSTOMER_ANALYTICS).find(([key]) => domain.includes(key))?.[1];

    if (analytics == null) {
        return null;
    }

    return (
        <>
            {analytics.ga4 && <GoogleAnalytics gaId={analytics.ga4.id} dataLayerName={analytics.ga4.dataLayerName} />}
            {analytics.gtm && (
                <GoogleTagManager
                    gtmId={analytics.gtm.id}
                    dataLayer={analytics.gtm.dataLayer}
                    dataLayerName={analytics.gtm.dataLayerName}
                    auth={analytics.gtm.auth}
                    preview={analytics.gtm.preview}
                />
            )}
            {integrations?.intercom != null && <IntercomIntegration appId={integrations.intercom} />}
        </>
    );
}
