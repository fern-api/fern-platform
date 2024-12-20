import { AnalyticsProvider } from "@fern-docs/analytics/provider";
import { ReactNode } from "react";
import { useAnalyticsConfig, useApiRoute, useFernUser } from "../atoms";

export function CustomerAnalytics(): ReactNode {
    const config = useAnalyticsConfig();
    const user = useFernUser();
    const posthogRoute = useApiRoute("/api/fern-docs/analytics/posthog");
    return <AnalyticsProvider {...config} email={user?.email} name={user?.name} posthogRoute={posthogRoute} />;
}
