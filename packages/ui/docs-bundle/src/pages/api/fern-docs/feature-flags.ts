import { FeatureFlags } from "@fern-ui/ui";
import { getAll } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface EdgeConfigResponse {
    "api-playground-enabled": string[];
    "api-scrolling-disabled": string[];
    whitelabeled: string[];
    "seo-disabled": string[];
    "toc-default-enabled": string[]; // toc={true} in Steps, Tabs, and Accordions
    "snippet-template-enabled": string[];
}

export default async function handler(req: NextRequest): Promise<NextResponse<FeatureFlags>> {
    const domain = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host") ?? req.nextUrl.host;
    return NextResponse.json(await getFeatureFlags(domain));
}

export async function getFeatureFlags(domain: string): Promise<FeatureFlags> {
    try {
        const config = await getAll<EdgeConfigResponse>([
            "api-playground-enabled",
            "api-scrolling-disabled",
            "whitelabeled",
            "seo-disabled",
            "toc-default-enabled",
        ]);

        const isApiPlaygroundEnabled = checkDomainMatchesCustomers(domain, config["api-playground-enabled"]);
        const isApiScrollingDisabled = checkDomainMatchesCustomers(domain, config["api-scrolling-disabled"]);
        const isWhitelabeled = checkDomainMatchesCustomers(domain, config.whitelabeled);
        const isSeoDisabled = checkDomainMatchesCustomers(domain, config["seo-disabled"]);
        const isTocDefaultEnabled = checkDomainMatchesCustomers(domain, config["toc-default-enabled"]);
        const isSnippetTemplatesEnabled = checkDomainMatchesCustomers(domain, config["snippet-template-enabled"]);

        return {
            isApiPlaygroundEnabled: isApiPlaygroundEnabledOverrides(domain) || isApiPlaygroundEnabled,
            isApiScrollingDisabled,
            isWhitelabeled,
            isSeoDisabled: isSeoDisabledOverrides(domain) || isSeoDisabled,
            isTocDefaultEnabled,
            isSnippetTemplatesEnabled,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return {
            isApiPlaygroundEnabled: isApiPlaygroundEnabledOverrides(domain),
            isApiScrollingDisabled: false,
            isWhitelabeled: false,
            isSeoDisabled: isSeoDisabledOverrides(domain),
            isTocDefaultEnabled: false,
            isSnippetTemplatesEnabled: false,
        };
    }
}

function checkDomainMatchesCustomers(domain: string, customers: readonly string[]): boolean {
    return customers.some((customer) => domain.toLowerCase().includes(customer.toLowerCase()));
}

function isApiPlaygroundEnabledOverrides(domain: string): boolean {
    if (
        ["docs.buildwithfern.com", "fern.docs.buildwithfern.com", "fern.docs.dev.buildwithfern.com"].some(
            (d) => d === domain,
        )
    ) {
        return true;
    }

    if (process.env.NODE_ENV !== "production") {
        return true;
    }
    return false;
}

function isSeoDisabledOverrides(domain: string): boolean {
    if (
        domain.includes(".docs.buildwithfern.com") ||
        domain.includes(".docs.dev.buildwithfern.com") ||
        domain.includes(".docs.staging.buildwithfern.com")
    ) {
        return true;
    }

    if (process.env.NODE_ENV !== "production") {
        return true;
    }
    return false;
}
