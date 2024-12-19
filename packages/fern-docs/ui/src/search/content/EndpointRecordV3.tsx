import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { HttpMethodBadge } from "@fern-docs/components/badges";
import cn, { clsx } from "clsx";
import { LongArrowDownLeft } from "iconoir-react";
import { SearchHitBreadCrumbsV2 } from "./SearchHitBreadCrumbsV2";

export declare namespace EndpointRecordV3 {
  export interface Props {
    hit:
      | Algolia.AlgoliaRecord.EndpointV3
      | Algolia.AlgoliaRecord.WebsocketV3
      | Algolia.AlgoliaRecord.WebhookV3;
    isHovered: boolean;
  }
}

export const EndpointRecordV3: React.FC<EndpointRecordV3.Props> = ({
  hit,
  isHovered,
}) => {
  return (
    <div className="flex w-full flex-col space-y-1.5">
      <div className="flex justify-between">
        <div
          className={cn(
            "line-clamp-1 flex gap-1 items-center text-sm text-start",
            {
              "t-muted": !isHovered,
              "t-accent-aaa": isHovered,
            }
          )}
        >
          <HttpMethodBadge
            method={hit.type === "websocket-v3" ? "GET" : hit.method}
            variant={isHovered ? "solid" : "subtle"}
            className={clsx({
              "tracking-tighter":
                hit.type === "endpoint-v3" && hit.isResponseStream,
            })}
          >
            {hit.type === "websocket-v3"
              ? "WSS"
              : hit.type === "endpoint-v3" && hit.isResponseStream
                ? "STREAM"
                : undefined}
          </HttpMethodBadge>
          <div className="space-x-0.5 font-mono">
            {hit.endpointPath
              .filter((p) => p.type !== "literal" || p.value !== "")
              .map((p, idx) =>
                visitDiscriminatedUnion(p, "type")._visit({
                  literal: (part) => <span key={idx}>{part.value}</span>,
                  pathParameter: (part) => (
                    <span
                      className={cn(
                        "items-center justify-center mx-0.5 rounded px-1 py-0.5 text-sm",
                        {
                          "bg-tag-default": !isHovered,
                          "bg-white/20 dark:bg-black/20": isHovered,
                        },
                        {
                          "t-muted": !isHovered,
                          "t-accent-aaa": isHovered,
                        }
                      )}
                      key={idx}
                    >
                      :{part.value}
                    </span>
                  ),
                  _other: () => null,
                })
              )}
          </div>
        </div>
        <div
          className={cn("text-sm tracking-wide", {
            "t-muted": !isHovered,
            "t-accent-aaa": isHovered,
          })}
        >
          Endpoint
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn("line-clamp-1 text-start text-xs", {
            "t-accent-aaa": isHovered,
            "t-muted": !isHovered,
          })}
        >
          <SearchHitBreadCrumbsV2 breadcrumb={hit.breadcrumbs} />
        </span>

        <LongArrowDownLeft
          className={cn("size-4", {
            "t-accent-aaa": isHovered,
            "t-muted": !isHovered,
          })}
        />
      </div>
    </div>
  );
};
