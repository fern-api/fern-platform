import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import { WebSocketMessage } from "../../api-page/web-socket/WebSocketMessages";

const WEBSOCKET_MESSAGES_ATOM = atom<Record<string, WebSocketMessage[]>>({});

interface UseWebsocketMessagesReturn {
    messages: WebSocketMessage[];
    pushMessage: (message: WebSocketMessage) => void;
}
export function useWebsocketMessages(websocketId: string): UseWebsocketMessagesReturn {
    const [messagesRecord, setMessagesRecord] = useAtom(WEBSOCKET_MESSAGES_ATOM);
    const messages = messagesRecord[websocketId] ?? [];
    const pushMessage = useCallback(
        (message: WebSocketMessage) => {
            setMessagesRecord((old) => ({
                ...old,
                [websocketId]: [...(old[websocketId] ?? []), message],
            }));
        },
        [setMessagesRecord, websocketId],
    );
    return { messages, pushMessage };
}
