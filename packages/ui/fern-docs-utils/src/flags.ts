export interface FeatureFlags {
    isApiPlaygroundEnabled: boolean;
    isApiScrollingDisabled: boolean;
    isWhitelabeled: boolean;
    isSeoDisabled: boolean;
    isTocDefaultEnabled: boolean;
    isSnippetTemplatesEnabled: boolean;
    isHttpSnippetsEnabled: boolean;
    isInlineFeedbackEnabled: boolean;
    isDarkCodeEnabled: boolean;
    proxyShouldUseAppBuildwithfernCom: boolean;
    isImageZoomDisabled: boolean;
    useJavaScriptAsTypeScript: boolean;
    alwaysEnableJavaScriptFetch: boolean;
    scrollInContainerEnabled: boolean;
    useMdxBundler: boolean;
    isBatchStreamToggleDisabled: boolean;
    isAuthEnabledInDocs: boolean;
    isAiChatbotEnabledInPreview: boolean;
    isAudioFileDownloadSpanSummary: boolean;
    isDocsLogoTextEnabled: boolean;
    isAudioExampleInternal: boolean;
    usesApplicationJsonInFormDataValue: boolean;
    isBinaryOctetStreamAudioPlayer: boolean;
    hasVoiceIdPlaygroundForm: boolean;
    isCohereTheme: boolean;
    isFileForgeHackEnabled: boolean;
    is404PageHidden: boolean;
    isNewSearchExperienceEnabled: boolean;
    isAuthenticatedPagesDiscoverable: boolean;
    // TODO: remove this after pinecone demo, this is a temporary flag
    grpcEndpoints: readonly string[];
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
    isApiPlaygroundEnabled: false,
    isApiScrollingDisabled: false,
    isWhitelabeled: false,
    isSeoDisabled: false,
    isTocDefaultEnabled: false,
    isSnippetTemplatesEnabled: false,
    isHttpSnippetsEnabled: false,
    isInlineFeedbackEnabled: false,
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
    isAuthenticatedPagesDiscoverable: false,
    // TODO: remove this after pinecone demo, this is a temporary flag
    grpcEndpoints: [],
};
