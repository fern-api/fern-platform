import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";

export interface JsConfig {
  remote:
    | {
        url: string;
        strategy:
          | "beforeInteractive"
          | "afterInteractive"
          | "lazyOnload"
          | undefined;
      }[]
    | undefined;
  inline: string[] | undefined;
}

export function withCustomJavascript(
  readShapeJsConfig: DocsV1Read.JsConfig | undefined,
  resolveFileSrc: (fileId: string) => { src: string } | undefined
): JsConfig | undefined {
  const remote = [
    ...(readShapeJsConfig?.remote ?? []),
    ...(readShapeJsConfig?.files ?? []).map((file) => ({
      url: resolveFileSrc(file.fileId)?.src,
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
