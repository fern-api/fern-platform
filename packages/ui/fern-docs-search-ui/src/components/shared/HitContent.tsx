import { tz } from "@date-fns/tz";
import { HttpMethodTag } from "@fern-ui/fern-http-method-tag";
import { format } from "date-fns";
import { Fragment, ReactElement } from "react";
import { Highlight, Snippet } from "react-instantsearch";
import { MarkRequired, UnreachableCaseError } from "ts-essentials";
import { AlgoliaRecordHit, ApiReferenceRecordHit, ChangelogRecordHit, MarkdownRecordHit } from "../types";

const utc = tz("UTC");

const headingLevels = ["h0", "h1", "h2", "h3", "h4", "h5", "h6"] as const;

function HierarchyBreadcrumb({
    hierarchy,
    level,
}: {
    hierarchy: Partial<Record<(typeof headingLevels)[number], { title?: string; id?: string }>> | undefined;
    level: (typeof headingLevels)[number] | undefined;
}) {
    if (!level) {
        return null;
    }

    const breadcrumb: string[] = [];

    headingLevels.slice(0, headingLevels.indexOf(level)).forEach((headingLevel) => {
        const title = hierarchy?.[headingLevel]?.title;
        if (title) {
            breadcrumb.push(title);
        }
    });

    return (
        <div className="text-xs text-[#969696] dark:text-white/50">
            {breadcrumb.map((title, idx) => (
                <Fragment key={title}>
                    <span>{title}</span>
                    {idx < breadcrumb.length - 1 && <span>{" / "}</span>}
                </Fragment>
            ))}
        </div>
    );
}

function MarkdownHitContent({ hit }: { hit: MarkdownRecordHit }): ReactElement {
    return (
        <div className="flex flex-col gap-1 min-w-0 shrink">
            <Highlight
                className="line-clamp-1"
                attribute="title"
                hit={hit}
                classNames={{
                    highlighted: "font-bold bg-transparent dark:bg-transparent dark:text-white",
                }}
            />
            <HierarchyBreadcrumb hierarchy={hit.hierarchy} level={hit.level} />
            <Snippet
                attribute={hit._highlightResult?.description ? "description" : "content"}
                hit={hit}
                className="text-sm leading-snug line-clamp-2 text-black/50 dark:text-white/50"
                classNames={{
                    highlighted: "font-bold bg-transparent dark:bg-transparent dark:text-white",
                }}
            />
        </div>
    );
}

function ChangelogHitContent({ hit }: { hit: ChangelogRecordHit }): ReactElement {
    const datestring = format(utc(hit.date), "MMM d, yyyy");
    return (
        <div className="flex flex-col gap-1 min-w-0 shrink">
            <Highlight
                className="line-clamp-1"
                attribute="title"
                hit={hit}
                classNames={{
                    highlighted: "font-bold bg-transparent dark:bg-transparent dark:text-white",
                }}
            />
            <div className="text-xs text-[#969696] dark:text-white/50">{datestring}</div>
            <Snippet
                attribute={hit._highlightResult?.description ? "description" : "content"}
                hit={hit}
                className="text-sm leading-snug line-clamp-2 text-black/50 dark:text-white/50"
                classNames={{
                    highlighted: "font-bold bg-transparent dark:bg-transparent dark:text-white",
                }}
            />
        </div>
    );
}

function ApiReferenceHitContent({ hit }: { hit: ApiReferenceRecordHit }): ReactElement {
    const attribute = hit._highlightResult?.request_description
        ? "request_description"
        : hit._highlightResult?.response_description
          ? "response_description"
          : hit._highlightResult?.payload_description
            ? "payload_description"
            : hit._highlightResult?.description
              ? "description"
              : undefined;
    return (
        <div className="flex flex-col gap-1 min-w-0 shrink">
            <Highlight
                className="line-clamp-1"
                attribute="title"
                hit={hit}
                classNames={{
                    highlighted: "font-bold bg-transparent dark:bg-transparent dark:text-white",
                }}
            />
            <div className="inline-flex items-baseline gap-1">
                <HttpMethodTag method={hit.method} size="sm" className="shrink-0" />
                <span className="text-xs font-mono line-clamp-2 text-[#969696] dark:text-white/50 break-words shrink">
                    {hit.endpoint_path}
                </span>
            </div>
            {attribute && (
                <Snippet
                    attribute={attribute}
                    hit={hit}
                    className="text-sm leading-snug line-clamp-2"
                    classNames={{
                        highlighted: "font-bold bg-transparent dark:bg-transparent dark:text-white",
                    }}
                />
            )}
        </div>
    );
}

export function HitContent({ hit }: { hit: MarkRequired<AlgoliaRecordHit, "type"> }): ReactElement | false {
    switch (hit.type) {
        case "markdown":
            return <MarkdownHitContent hit={hit as MarkdownRecordHit} />;
        case "changelog":
            return <ChangelogHitContent hit={hit as ChangelogRecordHit} />;
        case "api-reference":
            return <ApiReferenceHitContent hit={hit as ApiReferenceRecordHit} />;
        case "parameter":
        case "navigation":
            return false;
        default:
            throw new UnreachableCaseError(hit);
    }
}
