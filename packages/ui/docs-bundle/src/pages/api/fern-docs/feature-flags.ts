import { FeatureFlags } from "@fern-ui/ui";
import { getAll } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";

const FEATURE_FLAGS = [
    "api-playground-enabled" as const,
    "api-scrolling-disabled" as const,
    "whitelabeled" as const,
    "seo-disabled" as const,
    "toc-default-enabled" as const,
    "snippet-template-enabled" as const,
    "http-snippets-enabled" as const,
    "inline-feedback-enabled" as const,
    "dark-code-enabled" as const,
    "proxy-uses-app-buildwithfern" as const,
    "api-key-injection" as const,
];

type FeatureFlag = (typeof FEATURE_FLAGS)[number];
type CompanyList = string[];
type EdgeConfigResponse = Record<FeatureFlag, CompanyList | CustomerFeatureConfigs>;

export default async function handler(req: NextRequest): Promise<NextResponse<FeatureFlags>> {
    const domain = getXFernHostEdge(req);
    return NextResponse.json(await getFeatureFlags(domain));
}

export async function getFeatureFlags(domain: string): Promise<FeatureFlags> {
    try {
        const config = await getAll<EdgeConfigResponse>(FEATURE_FLAGS);

        const isApiPlaygroundEnabled = checkDomainMatchesCustomers(
            domain,
            config["api-playground-enabled"] as CompanyList,
        );
        const isApiScrollingDisabled = checkDomainMatchesCustomers(
            domain,
            config["api-scrolling-disabled"] as CompanyList,
        );
        const isWhitelabeled = checkDomainMatchesCustomers(domain, config.whitelabeled as CompanyList);
        const isSeoDisabled = checkDomainMatchesCustomers(domain, config["seo-disabled"] as CompanyList);
        const isTocDefaultEnabled = checkDomainMatchesCustomers(domain, config["toc-default-enabled"] as CompanyList);
        const isSnippetTemplatesEnabled = checkDomainMatchesCustomers(
            domain,
            config["snippet-template-enabled"] as CompanyList,
        );
        const isHttpSnippetsEnabled = checkDomainMatchesCustomers(
            domain,
            config["http-snippets-enabled"] as CompanyList,
        );
        const isInlineFeedbackEnabled = checkDomainMatchesCustomers(
            domain,
            config["inline-feedback-enabled"] as CompanyList,
        );
        const isDarkCodeEnabled = checkDomainMatchesCustomers(domain, config["dark-code-enabled"] as CompanyList);

        const apiInjectionConfig = getFeatureConfigForCustomer(
            domain,
            config["api-key-injection"] as CustomerFeatureConfigs,
        );

        const proxyShouldUseAppBuildwithfernCom = checkDomainMatchesCustomers(
            domain,
            config["proxy-uses-app-buildwithfern"] as CompanyList,
        );

        return {
            isApiPlaygroundEnabled: isApiPlaygroundEnabledOverrides(domain) || isApiPlaygroundEnabled,
            isApiScrollingDisabled,
            isWhitelabeled,
            isSeoDisabled: isSeoDisabledOverrides(domain) || isSeoDisabled,
            isTocDefaultEnabled,
            isSnippetTemplatesEnabled: isSnippetTemplatesEnabled || isDevelopment(domain),
            isHttpSnippetsEnabled,
            isInlineFeedbackEnabled,
            isDarkCodeEnabled,
            proxyShouldUseAppBuildwithfernCom,
            apiInjectionConfig,
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
            isSnippetTemplatesEnabled: isDevelopment(domain),
            isHttpSnippetsEnabled: false,
            isInlineFeedbackEnabled: isFern(domain),
            isDarkCodeEnabled: false,
            proxyShouldUseAppBuildwithfernCom: false,
            apiInjectionConfig: undefined,
        };
    }
}

function checkDomainMatchesCustomers(domain: string, customers: readonly string[]): boolean {
    return customers.some((customer) => domain.toLowerCase().includes(customer.toLowerCase()));
}

type CustomerFeatureConfig = Record<string, string> | undefined;

type CustomerFeatureConfigs = {
    [key: string]: CustomerFeatureConfig;
};

function getFeatureConfigForCustomer(domain: string, customers: CustomerFeatureConfigs): CustomerFeatureConfig {
    for (const customer in customers) {
        if (domain.toLowerCase().includes(customer.toLowerCase())) {
            return customers[customer];
        }
    }

    return undefined;
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
    if (domain.includes(".docs.staging.buildwithfern.com")) {
        return true;
    }
    return isDevelopment(domain);
}

function isDevelopment(domain: string): boolean {
    if (domain.includes(".docs.dev.buildwithfern.com") || domain.includes(".docs.staging.buildwithfern.com")) {
        return true;
    }

    if (process.env.NODE_ENV !== "production") {
        return true;
    }
    return false;
}

function isFern(domain: string): boolean {
    if (
        ["docs.buildwithfern.com", "fern.docs.buildwithfern.com", "fern.docs.dev.buildwithfern.com"].some(
            (d) => d === domain,
        )
    ) {
        return true;
    }

    return false;
}
