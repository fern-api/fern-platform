import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { HttpMethodBadge } from "@fern-docs/components/badges";
import cn, { clsx } from "clsx";
import type { BaseHit, Hit } from "instantsearch.js";
import { CornerDownLeft } from "lucide-react";
import { AlgoliaSnippet } from "../algolia/AlgoliaSnippet";
import { SearchHitBreadCrumbsV3 } from "./SearchHitBreadCrumbsV3";

export declare namespace FieldRecordV1 {
  export interface Props {
    hit: Hit<
      (
        | Algolia.AlgoliaRecord.EndpointFieldV1
        | Algolia.AlgoliaRecord.WebsocketFieldV1
        | Algolia.AlgoliaRecord.WebhookFieldV1
      ) &
        BaseHit
    >;
    isHovered: boolean;
  }
}

export const FieldRecordV1: React.FC<FieldRecordV1.Props> = ({
  hit,
  isHovered,
}) => {
  return (
    <div className="flex w-full flex-col space-y-1.5">
      <div className="flex justify-between">
        <div
          className={cn(
            "line-clamp-1 flex items-center gap-1 text-start text-sm",
            {
              "t-muted": !isHovered,
              "t-accent-aaa": isHovered,
            }
          )}
        >
          <HttpMethodBadge
            method={hit.type === "websocket-field-v1" ? "GET" : hit.method}
            variant={isHovered ? "solid" : "subtle"}
            className={clsx({
              "tracking-tighter":
                hit.type === "endpoint-field-v1" && hit.isResponseStream,
            })}
          >
            {hit.type === "websocket-field-v1"
              ? "WSS"
              : hit.type === "endpoint-field-v1" && hit.isResponseStream
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
                        "mx-0.5 items-center justify-center rounded px-1 py-0.5 text-sm",
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
      </div>
      <span
        className={cn("line-clamp-1 text-start text-xs", {
          "t-accent-aaa": isHovered,
          "t-muted": !isHovered,
        })}
      >
        {
          <div className="flex items-center justify-between">
            <span
              className={cn("line-clamp-1 text-start text-xs", {
                "t-accent-aaa": isHovered,
                "t-muted": !isHovered,
              })}
            >
              <AlgoliaSnippet hit={hit} />
            </span>
          </div>
        }
      </span>
      <div className="flex items-center justify-between">
        <span
          className={cn("line-clamp-1 text-start text-xs", {
            "t-accent-aaa": isHovered,
            "t-muted": !isHovered,
          })}
        >
          <SearchHitBreadCrumbsV3
            breadcrumb={
              isHovered
                ? hit.breadcrumbs
                : hit.breadcrumbs.filter(
                    (breadcrumb) => !breadcrumb.slug.includes("#")
                  )
            }
          />
        </span>

        <CornerDownLeft
          className={cn("size-4", {
            "t-accent-aaa": isHovered,
            "t-muted": !isHovered,
          })}
        />
      </div>
    </div>
  );
};
