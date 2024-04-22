import { FeatureFlags } from "@fern-ui/ui";
import { getAll } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";
import { withEdgeHighlight } from "../../../utils/edgeHighlight.config";

export const runtime = "edge";

interface EdgeConfigResponse {
    "api-playground-enabled": string[];
    "api-scrolling-disabled": string[];
    whitelabeled: string[];
}

async function handler(req: NextRequest): Promise<NextResponse<FeatureFlags>> {
    const domain = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host") ?? req.nextUrl.host;
    return NextResponse.json(await getFeatureFlags(domain));
}

export default withEdgeHighlight(handler);

export async function getFeatureFlags(domain: string): Promise<FeatureFlags> {
    try {
        const config = await getAll<EdgeConfigResponse>([
            "api-playground-enabled",
            "api-scrolling-disabled",
            "whitelabeled",
        ]);

        const isApiPlaygroundEnabled = checkDomainMatchesCustomers(domain, config["api-playground-enabled"]);
        const isApiScrollingDisabled = checkDomainMatchesCustomers(domain, config["api-scrolling-disabled"]);
        const isWhitelabeled = checkDomainMatchesCustomers(domain, config.whitelabeled);

        return {
            isApiPlaygroundEnabled: isApiPlaygroundEnabledOverrides(domain) || isApiPlaygroundEnabled,
            isApiScrollingDisabled,
            isWhitelabeled,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return {
            isApiPlaygroundEnabled: isApiPlaygroundEnabledOverrides(domain),
            isApiScrollingDisabled: false,
            isWhitelabeled: false,
        };
    }
}

function checkDomainMatchesCustomers(domain: string, customers: readonly string[]): boolean {
    return customers.some((customer) => domain.toLowerCase().includes(customer.toLowerCase()));
}

function isApiPlaygroundEnabledOverrides(domain: string): boolean {
    if (["docs.buildwithfern.com", "fern.docs.buildwithfern.com", "fern.docs.dev.buildwithfern.com"].includes(domain)) {
        return true;
    }

    if (process.env.NODE_ENV !== "production") {
        return true;
    }
    return false;
}
