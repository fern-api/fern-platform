import { isCustomDomain, isFern } from "@/server/isCustomDomain";
import { isDevelopment } from "@/server/isDevelopment";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { FeatureFlags } from "@fern-ui/ui";
import { getAll } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";

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
    "image-zoom-disabled" as const,
    "use-javascript-as-typescript" as const,
    "always-enable-javascript-fetch" as const,
    "scroll-in-container-enabled" as const,
    "use-mdx-bundler" as const,
    "batch-stream-toggle-disabled" as const,
    "enabled-auth-in-generated-docs" as const,
    "ai-chat-preview" as const,
    "audio-file-download-span-summary" as const,
    "docs-logo-text-enabled" as const,
    "audio-example-internal" as const,
    "uses-application-json-in-form-data-value" as const,
    "binary-octet-stream-audio-player" as const,
    "voice-id-playground-form" as const,
    "cohere-theme" as const,
    "file-forge-hack-enabled" as const,
    "hide-404-page" as const,
    "new-search-experience" as const,
    "grpc-endpoints" as const,
];

type FeatureFlag = (typeof FEATURE_FLAGS)[number];

type EdgeConfigResponse = Record<FeatureFlag, string[]>;

export default async function handler(req: NextRequest): Promise<NextResponse<FeatureFlags>> {
    const domain = getXFernHostEdge(req);
    return NextResponse.json(await getFeatureFlags(domain));
}

export async function getFeatureFlags(domain: string): Promise<FeatureFlags> {
    try {
        const config = await getAll<EdgeConfigResponse>(FEATURE_FLAGS);

        const isApiPlaygroundEnabled = checkDomainMatchesCustomers(domain, config["api-playground-enabled"]);
        const isApiScrollingDisabled = checkDomainMatchesCustomers(domain, config["api-scrolling-disabled"]);
        const isWhitelabeled = checkDomainMatchesCustomers(domain, config.whitelabeled);
        const isSeoDisabled = checkDomainMatchesCustomers(domain, config["seo-disabled"]);
        const isTocDefaultEnabled = checkDomainMatchesCustomers(domain, config["toc-default-enabled"]);
        const isSnippetTemplatesEnabled = checkDomainMatchesCustomers(domain, config["snippet-template-enabled"]);
        const isHttpSnippetsEnabled = checkDomainMatchesCustomers(domain, config["http-snippets-enabled"]);
        const isInlineFeedbackEnabled = checkDomainMatchesCustomers(domain, config["inline-feedback-enabled"]);
        const isDarkCodeEnabled = checkDomainMatchesCustomers(domain, config["dark-code-enabled"]);
        const proxyShouldUseAppBuildwithfernCom = checkDomainMatchesCustomers(
            domain,
            config["proxy-uses-app-buildwithfern"],
        );
        const isImageZoomDisabled = checkDomainMatchesCustomers(domain, config["image-zoom-disabled"]);
        const useJavaScriptAsTypeScript = checkDomainMatchesCustomers(domain, config["use-javascript-as-typescript"]);
        const alwaysEnableJavaScriptFetch = checkDomainMatchesCustomers(
            domain,
            config["always-enable-javascript-fetch"],
        );
        const scrollInContainerEnabled = checkDomainMatchesCustomers(domain, config["scroll-in-container-enabled"]);
        const useMdxBundler = checkDomainMatchesCustomers(domain, config["use-mdx-bundler"]);
        const isBatchStreamToggleDisabled = checkDomainMatchesCustomers(domain, config["batch-stream-toggle-disabled"]);
        const isAuthEnabledInDocs = checkDomainMatchesCustomers(domain, config["enabled-auth-in-generated-docs"]);
        const isAiChatbotEnabledInPreview = checkDomainMatchesCustomers(domain, config["ai-chat-preview"]);
        const isAudioFileDownloadSpanSummary = checkDomainMatchesCustomers(
            domain,
            config["audio-file-download-span-summary"],
        );
        const isDocsLogoTextEnabled = checkDomainMatchesCustomers(domain, config["docs-logo-text-enabled"]);
        const isAudioExampleInternal = checkDomainMatchesCustomers(domain, config["audio-example-internal"]);
        const usesApplicationJsonInFormDataValue = checkDomainMatchesCustomers(
            domain,
            config["uses-application-json-in-form-data-value"],
        );
        const isBinaryOctetStreamAudioPlayer = checkDomainMatchesCustomers(
            domain,
            config["binary-octet-stream-audio-player"],
        );
        const hasVoiceIdPlaygroundForm = checkDomainMatchesCustomers(domain, config["voice-id-playground-form"]);
        const isCohereTheme = checkDomainMatchesCustomers(domain, config["cohere-theme"]);
        const isFileForgeHackEnabled = checkDomainMatchesCustomers(domain, config["file-forge-hack-enabled"]);
        const is404PageHidden = checkDomainMatchesCustomers(domain, config["hide-404-page"]);
        const isNewSearchExperienceEnabled = checkDomainMatchesCustomers(domain, config["new-search-experience"]);
        const grpcEndpoints = config["grpc-endpoints"];

        return {
            isApiPlaygroundEnabled: isDevelopment(domain) || isApiPlaygroundEnabled,
            isApiScrollingDisabled,
            isWhitelabeled,
            isSeoDisabled: !isCustomDomain(domain) || isSeoDisabled,
            isTocDefaultEnabled,
            isSnippetTemplatesEnabled: isSnippetTemplatesEnabled || isDevelopment(domain),
            isHttpSnippetsEnabled,
            isInlineFeedbackEnabled,
            isDarkCodeEnabled,
            proxyShouldUseAppBuildwithfernCom,
            isImageZoomDisabled,
            useJavaScriptAsTypeScript,
            alwaysEnableJavaScriptFetch,
            scrollInContainerEnabled,
            useMdxBundler,
            isBatchStreamToggleDisabled,
            isAuthEnabledInDocs,
            isAiChatbotEnabledInPreview,
            isAudioFileDownloadSpanSummary,
            isDocsLogoTextEnabled,
            isAudioExampleInternal,
            usesApplicationJsonInFormDataValue,
            isBinaryOctetStreamAudioPlayer,
            hasVoiceIdPlaygroundForm,
            isCohereTheme,
            isFileForgeHackEnabled,
            is404PageHidden,
            isNewSearchExperienceEnabled,
            grpcEndpoints,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return {
            isApiPlaygroundEnabled: isDevelopment(domain),
            isApiScrollingDisabled: false,
            isWhitelabeled: false,
            isSeoDisabled: !isCustomDomain(domain),
            isTocDefaultEnabled: false,
            isSnippetTemplatesEnabled: isDevelopment(domain),
            isHttpSnippetsEnabled: false,
            isInlineFeedbackEnabled: isFern(domain),
            isDarkCodeEnabled: false,
            proxyShouldUseAppBuildwithfernCom: false,
            isImageZoomDisabled: false,
            useJavaScriptAsTypeScript: false,
            alwaysEnableJavaScriptFetch: false,
            scrollInContainerEnabled: false,
            useMdxBundler: false,
            isBatchStreamToggleDisabled: false,
            isAuthEnabledInDocs: false,
            isAiChatbotEnabledInPreview: false,
            isAudioFileDownloadSpanSummary: false,
            isDocsLogoTextEnabled: false,
            isAudioExampleInternal: false,
            usesApplicationJsonInFormDataValue: false,
            isBinaryOctetStreamAudioPlayer: false,
            hasVoiceIdPlaygroundForm: false,
            isCohereTheme: false,
            isFileForgeHackEnabled: false,
            is404PageHidden: false,
            isNewSearchExperienceEnabled: false,
            grpcEndpoints: [],
        };
    }
}

function checkDomainMatchesCustomers(domain: string, customers: readonly string[]): boolean {
    if (customers == null) {
        return false;
    }
    return customers.some((customer) => domain.toLowerCase().includes(customer.toLowerCase()));
}
