import { ReactElement } from "react";

import { round } from "es-toolkit/math";
import { useAtomValue } from "jotai";
import { Download } from "lucide-react";

import { cn } from "@fern-docs/components";
import {
  CopyToClipboardButton,
  FernAudioPlayer,
  FernButton,
  FernCard,
  FernTooltip,
  FernTooltipProvider,
} from "@fern-docs/components";
import { Loadable, visitLoadable } from "@fern-ui/loadable";

import { ErrorBoundaryFallback } from "@/components/error-boundary";
import { isBinaryOctetStreamAudioPlayerAtom } from "@/state/api-explorer-flags";

import { PlaygroundResponsePreview } from "../PlaygroundResponsePreview";
import { PlaygroundSendRequestButton } from "../PlaygroundSendRequestButton";
import { PlaygroundResponse } from "../types/playgroundResponse";
import { ProxyResponse } from "../types/proxy";

interface PlaygroundResponseCard {
  response: Loadable<PlaygroundResponse>;
  sendRequest: () => void;
}

export function PlaygroundResponseCard({
  response,
  sendRequest,
}: PlaygroundResponseCard): ReactElement<any> {
  const isBinaryOctetStreamAudioPlayer = useAtomValue(
    isBinaryOctetStreamAudioPlayerAtom
  );
  return (
    <FernCard className="rounded-3 flex min-w-0 flex-1 shrink flex-col overflow-hidden">
      <div className="border-border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
        <span className="text-(color:--grayscale-a11) text-xs uppercase">
          Response
        </span>

        {response.type === "loaded" && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "rounded-3/2 flex h-5 items-center px-1.5 py-1 font-mono",
                {
                  ["bg-(color:--accent-a3) text-(color:--accent-a11)"]:
                    response.value.response.status >= 200 &&
                    response.value.response.status < 300,
                  ["bg-(color:--red-a3) text-(color:--red-a11)"]:
                    response.value.response.status > 300,
                }
              )}
            >
              status: {response.value.response.status}
            </span>
            <span
              className={
                "bg-(color:--grayscale-a3) rounded-3/2 flex h-5 items-center px-1.5 py-1 font-mono"
              }
            >
              time: {round(response.value.time, 2)}ms
            </span>
            {response.value.type === "json" &&
              response.value.size != null &&
              response.value.size.trim().length > 0 && (
                <span
                  className={
                    "bg-(color:--grayscale-a3) rounded-3/2 flex h-5 items-center px-1.5 py-1 font-mono"
                  }
                >
                  size: {response.value.size}b
                </span>
              )}
          </div>
        )}

        {visitLoadable(response, {
          loading: () => <div />,
          loaded: (response) =>
            response.type === "file" ? (
              <FernTooltipProvider>
                <FernTooltip content="Download file">
                  <FernButton
                    icon={<Download />}
                    size="small"
                    variant="minimal"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = response.response.body;
                      a.download = createFilename(
                        response.response,
                        response.contentType
                      );
                      a.click();
                    }}
                  />
                </FernTooltip>
              </FernTooltipProvider>
            ) : (
              <CopyToClipboardButton
                content={() =>
                  response.type === "json"
                    ? JSON.stringify(response.response.body, null, 2)
                    : response.type === "stream"
                      ? response.response.body
                      : ""
                }
                className="-mr-2"
              />
            ),
          failed: () => (
            <span className="bg-(color:--red-a3) text-(color:--red-a11) rounded-1 flex items-center p-1 font-mono text-xs uppercase leading-none">
              Failed
            </span>
          ),
        })}
      </div>
      {visitLoadable(response, {
        loading: () =>
          response.type === "notStartedLoading" ? (
            <div className="flex flex-1 items-center justify-center">
              <PlaygroundSendRequestButton sendRequest={sendRequest} />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              Loading...
            </div>
          ),
        loaded: (response) => {
          // Handle JSON content type
          try {
            JSON.parse(JSON.stringify(response.response.body));
            return <PlaygroundResponsePreview response={response} />;
          } catch {
            // If JSON parsing fails, continue to next handler
          }

          // Handle text-based content
          if (
            response.type !== "file" ||
            response.contentType.startsWith("text") ||
            response.contentType.startsWith("application/xml")
          ) {
            return <PlaygroundResponsePreview response={response} />;
          }

          // Handle audio content
          if (
            response.contentType.startsWith("audio/") ||
            (isBinaryOctetStreamAudioPlayer &&
              response.contentType === "binary/octet-stream")
          ) {
            return (
              <FernAudioPlayer
                src={response.response.body}
                className="flex h-full items-center justify-center p-4"
              />
            );
          }

          // Handle PDF content
          if (response.contentType.includes("application/pdf")) {
            return (
              <iframe
                src={response.response.body}
                className="size-full"
                title="PDF preview"
                allowFullScreen
              />
            );
          }

          // Handle 204 status
          if (response.response.status === 204) {
            return <PlaygroundResponsePreview response={response} />;
          }

          // Default case - unsupported file type
          return (
            <ErrorBoundaryFallback
              error={
                new Error(
                  `File preview not supported for ${response.contentType}`
                )
              }
            />
          );
        },
        failed: (e) => {
          console.error(e);
          return <ErrorBoundaryFallback error={new Error(String(e))} />;
        },
      })}
    </FernCard>
  );
}

function createFilename(
  body: ProxyResponse.SerializableFileBody,
  contentType: string
): string {
  const headers = new Headers(body.headers);
  const contentDisposition = headers.get("Content-Disposition");

  if (contentDisposition != null) {
    const filename = contentDisposition.split("filename=")[1];
    if (filename != null) {
      return filename;
    }
  }

  // TODO: use a more deterministic way to generate filenames
  const extension = contentType.split("/")[1];
  return `${crypto.randomUUID()}.${extension}`;
}
