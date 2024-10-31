import { tz } from "@date-fns/tz";
import { ParameterRecord } from "@fern-ui/fern-docs-search-server/types";
import { HttpMethodTag } from "@fern-ui/fern-http-method-tag";
import { Hit } from "algoliasearch/lite";
import { format } from "date-fns";
import { ReactElement } from "react";
import { Highlight, Snippet } from "react-instantsearch";
import { MarkRequired, UnreachableCaseError } from "ts-essentials";
import { AlgoliaRecordHit, ApiReferenceRecordHit, ChangelogRecordHit, MarkdownRecordHit } from "../types";

const utc = tz("UTC");

const headingLevels = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function HierarchyBreadcrumb({
    pageTitle,
    hierarchy,
    level,
}: {
    pageTitle: string | undefined;
    hierarchy: Partial<Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", { title?: string; id?: string }>> | undefined;
    level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined;
}) {
    if (!level) {
        return null;
    }

    const breadcrumb: string[] = [];

    if (pageTitle) {
        breadcrumb.push(pageTitle);
    }

    headingLevels.slice(0, headingLevels.indexOf(level)).forEach((headingLevel) => {
        const title = hierarchy?.[headingLevel]?.title;
        if (title) {
            breadcrumb.push(title);
        }
    });

    return (
        <div className="text-xs text-[#969696]">
            {breadcrumb.map((title, idx) => (
                <>
                    <span key={title}>{title}</span>
                    {idx < breadcrumb.length - 1 && <span>{" / "}</span>}
                </>
            ))}
        </div>
    );
}

function MarkdownHitContent({ hit }: { hit: MarkdownRecordHit }): ReactElement {
    return (
        <div className="flex flex-col gap-1">
            <Highlight
                className="line-clamp-1"
                attribute={hit._highlightResult?.level_title ? "level_title" : "page_title"}
                hit={hit}
                classNames={{
                    highlighted: "font-bold bg-transparent",
                }}
            />
            <HierarchyBreadcrumb pageTitle={hit.page_title} hierarchy={hit.hierarchy} level={hit.level} />
            <Snippet
                attribute={hit._highlightResult?.description ? "description" : "content"}
                hit={hit}
                className="text-sm leading-snug line-clamp-2 text-black/50"
                classNames={{
                    highlighted: "font-bold bg-transparent",
                }}
            />
        </div>
    );
}

function ChangelogHitContent({ hit }: { hit: ChangelogRecordHit }): ReactElement {
    return (
        <div className="flex flex-col gap-1">
            <Highlight
                className="line-clamp-1"
                attribute="page_title"
                hit={hit}
                classNames={{
                    highlighted: "font-bold bg-transparent",
                }}
            />
            <div className="text-xs text-[#969696]">{format(utc(hit.date), "MMM d, yyyy")}</div>
            <Snippet
                attribute={hit._highlightResult?.description ? "description" : "content"}
                hit={hit}
                className="text-sm leading-snug line-clamp-2 text-black/50"
                classNames={{
                    highlighted: "font-bold bg-transparent",
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
        <div className="flex flex-col gap-1">
            <Highlight
                className="line-clamp-1"
                attribute="page_title"
                hit={hit}
                classNames={{
                    highlighted: "font-bold bg-transparent",
                }}
            />
            <div className="flex items-baseline gap-1">
                <HttpMethodTag method={hit.method} size="sm" />
                <span className="text-xs font-mono line-clamp-1 text-[#969696]">{hit.endpoint_path}</span>
            </div>
            {attribute && (
                <Snippet
                    attribute={attribute}
                    hit={hit}
                    className="text-sm leading-snug line-clamp-2"
                    classNames={{
                        highlighted: "font-bold bg-transparent",
                    }}
                />
            )}
        </div>
    );
}

function ParameterHitContent({ hit }: { hit: MarkRequired<ParameterRecord, "type"> }): ReactElement {
    return <div>{hit.parameter_name}</div>;
}

export function HitContent({ hit }: { hit: MarkRequired<AlgoliaRecordHit, "type"> }): ReactElement {
    switch (hit.type) {
        case "markdown":
            return <MarkdownHitContent hit={hit as MarkdownRecordHit} />;
        case "changelog":
            return <ChangelogHitContent hit={hit as ChangelogRecordHit} />;
        case "api-reference":
            return <ApiReferenceHitContent hit={hit as ApiReferenceRecordHit} />;
        case "parameter":
            return <ParameterHitContent hit={hit as MarkRequired<Hit<ParameterRecord>, "type">} />;
        default:
            throw new UnreachableCaseError(hit);
    }
}
