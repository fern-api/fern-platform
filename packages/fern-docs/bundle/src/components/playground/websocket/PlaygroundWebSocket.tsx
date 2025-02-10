"use client";

import {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Wifi, WifiOff } from "iconoir-react";
import urlJoin from "url-join";

import type { WebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import {
  WebSocketMessage,
  buildRequestUrl,
} from "@fern-api/fdr-sdk/api-definition";
import { FernTooltipProvider } from "@fern-docs/components";
import { usePrevious } from "@fern-ui/react-commons";

import {
  PLAYGROUND_AUTH_STATE_ATOM,
  store,
  usePlaygroundWebsocketFormState,
} from "../../atoms";
import { usePlaygroundSettings } from "../../hooks/usePlaygroundSettings";
import { PlaygroundEndpointPath } from "../endpoint/PlaygroundEndpointPath";
import { useWebsocketMessages } from "../hooks/useWebsocketMessages";
import { buildAuthHeaders } from "../utils";
import { usePlaygroundBaseUrl } from "../utils/select-environment";
import { PlaygroundWebSocketContent } from "./PlaygroundWebSocketContent";

// TODO: decide if this should be an env variable, and if we should move REST proxy to the same (or separate) cloudflare worker
const WEBSOCKET_PROXY_URI = "wss://proxy.ferndocs.com/";

interface PlaygroundWebSocketProps {
  context: WebSocketContext;
}

export const PlaygroundWebSocket: FC<PlaygroundWebSocketProps> = ({
  context,
}): ReactElement<any> => {
  const [formState, setFormState] = usePlaygroundWebsocketFormState(context);
  const websocketMessageLimit = usePlaygroundSettings(context.node.id)?.[
    "limit-websocket-messages-per-connection"
  ];

  const [connectedState, setConnectedState] = useState<
    "opening" | "opened" | "closed"
  >("closed");
  const { pushMessage, clearMessages } = useWebsocketMessages(context.node.id);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionMessageCount, setActiveSessionMessageCount] = useState(0);

  const socket = useRef<WebSocket | null>(null);

  // close the socket when the websocket changes
  const prevWebsocket = usePrevious(context.node);
  useEffect(() => {
    if (prevWebsocket.id !== context.node.id) {
      socket.current?.close();
      setError(null);
    }
  }, [context.node.id, prevWebsocket.id]);

  // auto-destroy the socket when the component is unmounted
  useEffect(() => () => socket.current?.close(), []);

  // when we get to 20 messages, close the socket
  useEffect(() => {
    if (
      websocketMessageLimit &&
      activeSessionMessageCount >= websocketMessageLimit
    ) {
      socket.current?.close();
      setConnectedState("closed");
      pushMessage({
        type: "end",
        data: "END OF SAMPLE SESSION",
        origin: "endSample",
        displayName: undefined,
      });
    }
  }, [activeSessionMessageCount, pushMessage, websocketMessageLimit]);

  const settings = usePlaygroundSettings();

  const [baseUrl, environmentId] = usePlaygroundBaseUrl(context.channel);

  const startSession = useCallback(async () => {
    return new Promise<boolean>((resolve) => {
      if (
        socket.current != null &&
        socket.current.readyState !== WebSocket.CLOSED
      ) {
        resolve(true);
        return;
      }

      setError(null);

      const url = buildRequestUrl({
        baseUrl,
        path: context.channel.path,
        pathParameters: formState.pathParameters,
        queryParameters: formState.queryParameters,
      });

      setConnectedState("opening");

      socket.current = new WebSocket(urlJoin(WEBSOCKET_PROXY_URI, url));

      socket.current.onopen = () => {
        const authState = store.get(PLAYGROUND_AUTH_STATE_ATOM);
        const authHeaders = buildAuthHeaders(context.auth, authState, {
          redacted: false,
        });
        const headers = {
          ...authHeaders,
          ...formState.headers,
        };

        socket.current?.send(
          JSON.stringify({ type: "handshake", url, headers })
        );

        setConnectedState("opened");
        resolve(true);
      };

      socket.current.onmessage = (event) => {
        function maybeParsedData() {
          try {
            return JSON.parse(event.data);
          } catch {
            return event.data;
          }
        }

        if (
          !websocketMessageLimit ||
          activeSessionMessageCount < websocketMessageLimit
        ) {
          pushMessage({
            type: "received",
            data: maybeParsedData(),
            origin: "server",
            displayName: undefined,
          });
          setActiveSessionMessageCount((m) => m + 1);
        }
      };

      socket.current.onclose = (ev) => {
        setConnectedState("closed");
        resolve(false);

        if (ev.code !== 1000) {
          setError(ev.reason);
        }
        setActiveSessionMessageCount(0);
      };

      socket.current.onerror = (event) => {
        console.error(event);
      };
    });
  }, [
    baseUrl,
    context.channel.path,
    context.auth,
    formState.pathParameters,
    formState.queryParameters,
    formState.headers,
    pushMessage,
    activeSessionMessageCount,
    websocketMessageLimit,
  ]);

  const handleSendMessage = useCallback(
    async (message: WebSocketMessage, data: unknown) => {
      const isConnected = await startSession();
      if (
        isConnected &&
        socket.current != null &&
        socket.current.readyState === WebSocket.OPEN
      ) {
        // TODO: handle validation
        socket.current.send(JSON.stringify(data));
        pushMessage({
          type: message.type,
          data,
          origin: "client",
          displayName: message.displayName,
        });
      }
    },
    [pushMessage, startSession]
  );

  return (
    <FernTooltipProvider>
      <div className="flex h-full min-h-0 flex-1 shrink flex-col">
        <div className="flex-0">
          <PlaygroundEndpointPath
            method={undefined}
            formState={formState}
            sendRequest={() =>
              connectedState === "closed"
                ? startSession()
                : connectedState === "opened"
                  ? socket.current?.close()
                  : null
            }
            environmentId={environmentId}
            baseUrl={baseUrl}
            // TODO: this is a temporary fix to show all environments in the playground, unless filtered in the settings
            // this is so that the playground can be specifically disabled for certain environments
            options={
              settings?.environments
                ? context.channel.environments?.filter(
                    (env) => settings.environments?.includes(env.id) ?? true
                  )
                : context.channel.environments
            }
            path={context.channel.path}
            queryParameters={context.channel.queryParameters}
            sendRequestButtonLabel={
              connectedState === "closed"
                ? "Connect"
                : connectedState === "opening"
                  ? "Connecting..."
                  : "Disconnect"
            }
            sendRequestIcon={
              connectedState === "opening" ? null : connectedState ===
                "opened" ? (
                <WifiOff className="size-6 rotate-90" />
              ) : (
                <Wifi className="size-6 rotate-90" />
              )
            }
            types={context.types}
          />
        </div>
        <div className="flex min-h-0 flex-1 shrink">
          <PlaygroundWebSocketContent
            context={context}
            formState={formState}
            setFormState={setFormState}
            sendMessage={handleSendMessage}
            startSesssion={startSession}
            clearMessages={clearMessages}
            connected={connectedState === "opened"}
            error={error}
          />
        </div>
      </div>
    </FernTooltipProvider>
  );
};
