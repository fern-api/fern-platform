"use client";

import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactNode,
} from "react";

export const SyntaxHighlighterEdgeFlags = createContext({
  isDarkCodeEnabled: false,
});

export function SyntaxHighlighterEdgeFlagsProvider({
  children,
  isDarkCodeEnabled,
}: PropsWithChildren<{ isDarkCodeEnabled: boolean }>): ReactNode {
  return (
    <SyntaxHighlighterEdgeFlags.Provider value={{ isDarkCodeEnabled }}>
      {children}
    </SyntaxHighlighterEdgeFlags.Provider>
  );
}

export const useEdgeFlags = (): { isDarkCodeEnabled: boolean } => {
  return useContext(SyntaxHighlighterEdgeFlags);
};
