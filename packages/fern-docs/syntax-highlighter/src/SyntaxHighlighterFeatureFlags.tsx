import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactNode,
} from "react";

export const SyntaxHighlighterFeatureFlags = createContext({
  isDarkCodeEnabled: false,
});

export function SyntaxHighlighterFeatureFlagsProvider({
  children,
  isDarkCodeEnabled,
}: PropsWithChildren<{ isDarkCodeEnabled: boolean }>): ReactNode {
  return (
    <SyntaxHighlighterFeatureFlags.Provider value={{ isDarkCodeEnabled }}>
      {children}
    </SyntaxHighlighterFeatureFlags.Provider>
  );
}

export const useFeatureFlags = (): { isDarkCodeEnabled: boolean } => {
  return useContext(SyntaxHighlighterFeatureFlags);
};
