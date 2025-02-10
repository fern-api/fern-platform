"use client";

import {
  ExampleWebSocketSession,
  WebSocketChannel,
  toColonEndpointPathLiteral,
} from "@fern-api/fdr-sdk/api-definition";

import { usePlaygroundBaseUrl } from "@/components/playground/utils/select-environment";

export function HandshakeExample({
  channel,
  example,
}: {
  channel: WebSocketChannel;
  example: ExampleWebSocketSession | undefined;
}) {
  const [baseUrl] = usePlaygroundBaseUrl(channel);
  return (
    <div className="flex px-1 py-3">
      <table className="min-w-0 flex-1 shrink table-fixed border-separate border-spacing-x-2 whitespace-normal break-words font-mono text-sm">
        <tbody>
          <tr>
            <td className="text-left align-top">URL</td>
            <td className="text-left align-top">
              {`${baseUrl ?? ""}${example?.path ?? toColonEndpointPathLiteral(channel.path)}`}
            </td>
          </tr>
          <tr>
            <td className="text-left align-top">Method</td>
            <td className="text-left align-top">GET</td>
          </tr>
          <tr>
            <td className="text-left align-top">Status</td>
            <td className="text-left align-top">101 Switching Protocols</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
