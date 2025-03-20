import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";

import type { FileData } from "@/server/types";

import type { JsConfig } from "./JavascriptProvider";

export function withJsConfig(
  readShapeJsConfig: DocsV1Read.JsConfig | undefined,
  files: Record<string, FileData>
): JsConfig | undefined {
  const remote = [
    ...(readShapeJsConfig?.remote ?? []),
    ...(readShapeJsConfig?.files ?? []).map((file) => ({
      url: files[file.fileId]?.src,
      strategy: file.strategy,
    })),
  ].filter(isRemote);

  const toRet = {
    inline: readShapeJsConfig?.inline,
    remote: remote.length > 0 ? remote : undefined,
  };

  if (!toRet.inline && !toRet.remote) {
    return undefined;
  }

  return toRet;
}

type RemoteJs = NonNullable<JsConfig["remote"]>[number];

function isRemote(remote: {
  url: string | undefined; // potentially undefined if the file is not found
  strategy: RemoteJs["strategy"];
}): remote is RemoteJs {
  return remote.url != null;
}
