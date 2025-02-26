export interface EdgeFlags {
  isApiPlaygroundEnabled: boolean;
  isApiScrollingDisabled: boolean;
  isWhitelabeled: boolean;
  isSeoDisabled: boolean;
  isTocDefaultEnabled: boolean;
  isSnippetTemplatesEnabled: boolean;
  isSearchDisabled: boolean;
  isHttpSnippetsEnabled: boolean;
  isInlineFeedbackEnabled: boolean;
  isDarkCodeEnabled: boolean;
  isProxyDisabled: boolean;
  isImageZoomDisabled: boolean;
  useJavaScriptAsTypeScript: boolean;
  alwaysEnableJavaScriptFetch: boolean;
  scrollInContainerEnabled: boolean;
  useMdxBundler: boolean;
  isBatchStreamToggleDisabled: boolean;
  isAuthEnabledInDocs: boolean;
  isAskAiEnabled: boolean;
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
  isSearchV2Enabled: boolean;
  // TODO: remove this after pinecone demo, this is a temporary flag
  grpcEndpoints: readonly string[];
  isExplorerFabEnabled: boolean;
}

export const DEFAULT_EDGE_FLAGS: EdgeFlags = {
  isApiPlaygroundEnabled: false,
  isApiScrollingDisabled: false,
  isWhitelabeled: false,
  isSeoDisabled: false,
  isTocDefaultEnabled: false,
  isSnippetTemplatesEnabled: false,
  isSearchDisabled: false,
  isHttpSnippetsEnabled: false,
  isInlineFeedbackEnabled: false,
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
  isSearchV2Enabled: false,
  // TODO: remove this after pinecone demo, this is a temporary flag
  grpcEndpoints: [],
  isExplorerFabEnabled: false,
};
