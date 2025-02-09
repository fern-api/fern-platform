"use client";

import { usePlaygroundBaseUrl } from "@/components/playground/utils/select-environment";
import {
  toColonEndpointPathLiteral,
  WebSocketChannel,
} from "@fern-api/fdr-sdk/api-definition";
import { CopyToClipboardButton } from "@fern-docs/components";

export function CopyWithBaseUrl({ channel }: { channel: WebSocketChannel }) {
  const [baseUrl] = usePlaygroundBaseUrl(channel);
  return (
    <CopyToClipboardButton
      className="-mr-1"
      content={() =>
        `${baseUrl ?? ""}${toColonEndpointPathLiteral(channel.path)}`
      }
    />
  );
}
