import { get } from "@vercel/edge-config";
import urlJoin from "url-join";

export interface GTMParams {
    tagId: string;
}

// todo: migrate this to a fern definition
export interface CustomerAnalytics {
    // amplitude?: {
    //     apiKey: string;
    // };
    // clearbit?: {
    //     publicApiKey: string;
    // };
    // fathom?: {
    //     siteId: string;
    // };
    ga4?: {
        measurementId: string;
    };
    gtm?: GTMParams;
    // hotjar?: {
    //     hjid: number;
    //     hjsv: number;
    // };
    // koala?: {
    //     publicApiKey: string;
    // };
    // logrocket?: {
    //     appId: string;
    // };
    // mixpanel?: {
    //     projectToken: string;
    // };
    // pirsch?: {
    //     id: string;
    // };
    // plausible?: {
    //     domain: string;
    // };
    // posthog?: {
    //     apiKey: string;
    //     apiHost?: string;
    // };
}

export async function getCustomerAnalytics(host: string, basePath?: string): Promise<CustomerAnalytics | undefined> {
    const config = await get<Record<string, CustomerAnalytics>>("analytics");
    return config?.[urlJoin(host, basePath ?? "")];
}
