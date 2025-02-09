import { PrimitiveAtom, atom } from "jotai";
import { ReactNode, createContext, useContext, useRef } from "react";

export interface Footnote {
  ids: string[];
  url: string;
  title?: string;
  icon?: string;
  type?: string;
  api_type?: string;
}

const ChatbotTurnContext = createContext<PrimitiveAtom<Footnote[]>>(
  atom<Footnote[]>([])
);

export function ChatbotTurnContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const footnotes = useRef(atom<Footnote[]>([]));

  return (
    <ChatbotTurnContext.Provider value={footnotes.current}>
      {children}
    </ChatbotTurnContext.Provider>
  );
}

export function useChatbotTurnContext(): {
  footnotesAtom: PrimitiveAtom<Footnote[]>;
} {
  return {
    footnotesAtom: useContext(ChatbotTurnContext),
  };
}
