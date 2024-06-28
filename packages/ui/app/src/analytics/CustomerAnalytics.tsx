import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { ReactElement } from "react";

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
    humansignal: {
        ga4: {
            id: "G-5MGM6QQVFS",
        },
    fern: {
        ga4: {
            id: "GTM-WR6BQ98Q",
        },
    },
};

export function CustomerAnalytics({ domain }: { domain: string }): ReactElement | null {
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
        </>
    );
}
