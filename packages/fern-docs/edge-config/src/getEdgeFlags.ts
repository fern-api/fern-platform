import type { EdgeFlags } from "@fern-docs/utils";
import {
  isCustomDomain,
  isDevelopment,
  isFern,
  withoutStaging,
} from "@fern-docs/utils";
import { getAll } from "@vercel/edge-config";

export const runtime = "edge";

const EDGE_FLAGS = [
  "api-playground-enabled" as const,
  "api-scrolling-disabled" as const,
  "whitelabeled" as const,
  "seo-disabled" as const,
  "toc-default-enabled" as const,
  "snippet-template-enabled" as const,
  "http-snippets-enabled" as const,
  "search-disabled" as const,
  "inline-feedback-enabled" as const,
  "dark-code-enabled" as const,
  "disable-proxy" as const,
  "image-zoom-disabled" as const,
  "use-javascript-as-typescript" as const,
  "always-enable-javascript-fetch" as const,
  "scroll-in-container-enabled" as const,
  "use-mdx-bundler" as const,
  "batch-stream-toggle-disabled" as const,
  "enabled-auth-in-generated-docs" as const,
  "ask-ai-enabled" as const,
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
  "authenticated-pages-discoverable" as const,
  "search-v2" as const,
  "explorer-fab-enabled" as const,
];

type EdgeFlag = (typeof EDGE_FLAGS)[number];

type EdgeConfigResponse = Record<EdgeFlag, string[]>;

export async function getEdgeFlags(domain: string): Promise<EdgeFlags> {
  try {
    const config = await getAll<EdgeConfigResponse>(EDGE_FLAGS);

    const isApiPlaygroundEnabled = checkDomainMatchesCustomers(
      domain,
      config["api-playground-enabled"]
    );
    const isApiScrollingDisabled = checkDomainMatchesCustomers(
      domain,
      config["api-scrolling-disabled"]
    );
    const isWhitelabeled = checkDomainMatchesCustomers(
      domain,
      config.whitelabeled
    );
    const isSeoDisabled = checkDomainMatchesCustomers(
      domain,
      config["seo-disabled"]
    );
    const isTocDefaultEnabled = checkDomainMatchesCustomers(
      domain,
      config["toc-default-enabled"]
    );
    const isSnippetTemplatesEnabled = checkDomainMatchesCustomers(
      domain,
      config["snippet-template-enabled"]
    );
    const isSearchDisabled = checkDomainMatchesCustomers(
      domain,
      config["search-disabled"]
    );
    const isHttpSnippetsEnabled = checkDomainMatchesCustomers(
      domain,
      config["http-snippets-enabled"]
    );
    const isInlineFeedbackEnabled = checkDomainMatchesCustomers(
      domain,
      config["inline-feedback-enabled"]
    );
    const isDarkCodeEnabled = checkDomainMatchesCustomers(
      domain,
      config["dark-code-enabled"]
    );
    const isProxyDisabled = checkDomainMatchesCustomers(
      domain,
      config["disable-proxy"]
    );
    const isImageZoomDisabled = checkDomainMatchesCustomers(
      domain,
      config["image-zoom-disabled"]
    );
    const useJavaScriptAsTypeScript = checkDomainMatchesCustomers(
      domain,
      config["use-javascript-as-typescript"]
    );
    const alwaysEnableJavaScriptFetch = checkDomainMatchesCustomers(
      domain,
      config["always-enable-javascript-fetch"]
    );
    const scrollInContainerEnabled = checkDomainMatchesCustomers(
      domain,
      config["scroll-in-container-enabled"]
    );
    const useMdxBundler = checkDomainMatchesCustomers(
      domain,
      config["use-mdx-bundler"]
    );
    const isBatchStreamToggleDisabled = checkDomainMatchesCustomers(
      domain,
      config["batch-stream-toggle-disabled"]
    );
    const isAuthEnabledInDocs = checkDomainMatchesCustomers(
      domain,
      config["enabled-auth-in-generated-docs"]
    );
    const isAskAiEnabled = checkDomainMatchesCustomers(
      domain,
      config["ask-ai-enabled"]
    );
    const isAudioFileDownloadSpanSummary = checkDomainMatchesCustomers(
      domain,
      config["audio-file-download-span-summary"]
    );
    const isDocsLogoTextEnabled = checkDomainMatchesCustomers(
      domain,
      config["docs-logo-text-enabled"]
    );
    const isAudioExampleInternal = checkDomainMatchesCustomers(
      domain,
      config["audio-example-internal"]
    );
    const usesApplicationJsonInFormDataValue = checkDomainMatchesCustomers(
      domain,
      config["uses-application-json-in-form-data-value"]
    );
    const isBinaryOctetStreamAudioPlayer = checkDomainMatchesCustomers(
      domain,
      config["binary-octet-stream-audio-player"]
    );
    const hasVoiceIdPlaygroundForm = checkDomainMatchesCustomers(
      domain,
      config["voice-id-playground-form"]
    );
    const isCohereTheme = checkDomainMatchesCustomers(
      domain,
      config["cohere-theme"]
    );
    const isFileForgeHackEnabled = checkDomainMatchesCustomers(
      domain,
      config["file-forge-hack-enabled"]
    );
    const is404PageHidden = checkDomainMatchesCustomers(
      domain,
      config["hide-404-page"]
    );
    const isNewSearchExperienceEnabled = checkDomainMatchesCustomers(
      domain,
      config["new-search-experience"]
    );
    const isAuthenticatedPagesDiscoverable = checkDomainMatchesCustomers(
      domain,
      config["authenticated-pages-discoverable"]
    );
    const isExplorerFabEnabled = checkDomainMatchesCustomers(
      domain,
      config["explorer-fab-enabled"]
    );
    const isSearchV2Enabled =
      domain === "buildwithfern.com"
        ? true
        : checkDomainMatchesCustomers(domain, config["search-v2"]);
    const grpcEndpoints = config["grpc-endpoints"];

    return {
      isApiPlaygroundEnabled: isDevelopment(domain) || isApiPlaygroundEnabled,
      isApiScrollingDisabled,
      isWhitelabeled,
      isSeoDisabled: !isCustomDomain(domain) || isSeoDisabled,
      isTocDefaultEnabled,
      isSnippetTemplatesEnabled:
        isSnippetTemplatesEnabled || isDevelopment(domain),
      isSearchDisabled,
      isHttpSnippetsEnabled,
      isInlineFeedbackEnabled,
      isDarkCodeEnabled,
      isProxyDisabled,
      isImageZoomDisabled,
      useJavaScriptAsTypeScript,
      alwaysEnableJavaScriptFetch,
      scrollInContainerEnabled,
      useMdxBundler,
      isBatchStreamToggleDisabled,
      isAuthEnabledInDocs,
      isAskAiEnabled,
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
      isAuthenticatedPagesDiscoverable,
      isSearchV2Enabled,
      grpcEndpoints,
      isExplorerFabEnabled,
    };
  } catch (e) {
    console.error(e);
    return {
      isApiPlaygroundEnabled: isDevelopment(domain),
      isApiScrollingDisabled: false,
      isWhitelabeled: false,
      isSeoDisabled: !isCustomDomain(domain),
      isTocDefaultEnabled: false,
      isSnippetTemplatesEnabled: isDevelopment(domain),
      isSearchDisabled: false,
      isHttpSnippetsEnabled: false,
      isInlineFeedbackEnabled: isFern(domain),
      isDarkCodeEnabled: false,
      isProxyDisabled: false,
      isImageZoomDisabled: false,
      useJavaScriptAsTypeScript: false,
      alwaysEnableJavaScriptFetch: false,
      scrollInContainerEnabled: false,
      useMdxBundler: false,
      isBatchStreamToggleDisabled: false,
      isAuthEnabledInDocs: false,
      isAskAiEnabled: false,
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
      isAuthenticatedPagesDiscoverable: false,
      isSearchV2Enabled: domain === "buildwithfern.com",
      grpcEndpoints: [],
      isExplorerFabEnabled: false,
    };
  }
}

function checkDomainMatchesCustomers(
  domain: string,
  customers: readonly string[]
): boolean {
  if (customers == null) {
    return false;
  }
  const domainWithoutDocs = domain
    .replace(".docs.buildwithfern.com", "")
    .replace(".docs.staging.buildwithfern.com", "")
    .replace(".docs.dev.buildwithfern.com", "")
    .replace(".buildwithfern.dev", "")
    .replace(".ferndocs.dev", "")
    .replace(".ferndocs.app", "")
    .replace(".ferndocs.com", "");
  return (
    customers.some((customer) =>
      domainWithoutDocs.toLowerCase().includes(customer.toLowerCase())
    ) ||
    customers.includes(domain) ||
    customers.includes(withoutStaging(domain))
  );
}
