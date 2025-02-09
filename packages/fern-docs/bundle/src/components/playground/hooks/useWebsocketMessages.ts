import { WebSocketMessage } from "@/components/api-reference/websockets/WebSocketMessages";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";

const WEBSOCKET_MESSAGES_ATOM = atom<Record<string, WebSocketMessage[]>>({});

interface UseWebsocketMessagesReturn {
  messages: WebSocketMessage[];
  pushMessage: (message: WebSocketMessage) => void;
  clearMessages: () => void;
}
export function useWebsocketMessages(
  websocketId: string
): UseWebsocketMessagesReturn {
  const [messagesRecord, setMessagesRecord] = useAtom(WEBSOCKET_MESSAGES_ATOM);
  const messages = messagesRecord[websocketId] ?? [];
  const pushMessage = useCallback(
    (message: WebSocketMessage) => {
      setMessagesRecord((old) => ({
        ...old,
        [websocketId]: [...(old[websocketId] ?? []), message],
      }));
    },
    [setMessagesRecord, websocketId]
  );
  const clearMessages = useCallback(() => {
    setMessagesRecord((old) => ({
      ...old,
      [websocketId]: [],
    }));
  }, [setMessagesRecord, websocketId]);
  return { messages, pushMessage, clearMessages };
}
