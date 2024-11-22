import { tz } from "@date-fns/tz";
import { AvailabilityBadge, HttpMethodBadge } from "@fern-ui/fern-docs-badges";
import clsx from "clsx";
import { format } from "date-fns";
import { Fragment, ReactElement, ReactNode } from "react";
import { Highlight, Snippet } from "react-instantsearch";
import { MarkRequired, UnreachableCaseError } from "ts-essentials";
import { AlgoliaRecordHit, ApiReferenceRecordHit, ChangelogRecordHit, MarkdownRecordHit } from "../types";

const utc = tz("UTC");

const headingLevels = ["h0", "h1", "h2", "h3", "h4", "h5", "h6"] as const;

function Breadcrumb({ breadcrumb }: { breadcrumb: string[] }): ReactNode {
    if (breadcrumb.length === 0) {
        return false;
    }

    return (
        <div className="fern-search-hit-breadcrumb">
            {breadcrumb.map((title, idx) => (
                <Fragment key={title}>
                    <span>{title}</span>
                    {idx < breadcrumb.length - 1 && <span>{" / "}</span>}
                </Fragment>
            ))}
        </div>
    );
}

type SegmentType = "markdown" | "changelog" | "parameter" | "http" | "webhook" | "websocket";
const SEGMENT_DISPLAY_NAMES: Record<SegmentType, string> = {
    markdown: "Guides",
    changelog: "Changelog",
    parameter: "Parameters",
    http: "Endpoints",
    webhook: "Webhooks",
    websocket: "WebSockets",
};

function HitContentWithTitle({
    hit,
    children,
    // rightContent,
}: {
    hit: AlgoliaRecordHit;
    children: ReactNode;
    // rightContent?: ReactNode;
}): ReactElement {
    return (
        <div className="space-y-1 flex-1 shrink min-w-0">
            <div className="flex items-baseline gap-1 justify-between">
                <Highlight
                    attribute="title"
                    hit={hit}
                    classNames={{
                        root: clsx("fern-search-hit-title", {
                            deprecated:
                                hit.availability === "Deprecated" ||
                                hit.availability === "Sunset" ||
                                hit.availability === "Retired",
                        }),
                        highlighted: "fern-search-hit-highlighted",
                        nonHighlighted: "fern-search-hit-non-highlighted",
                    }}
                />
                {hit.availability && <AvailabilityBadge availability={hit.availability} size="sm" rounded />}
                {!hit.availability && (
                    <span className="text-[var(--grayscale-a10)] text-sm">
                        {SEGMENT_DISPLAY_NAMES[hit.type === "api-reference" ? hit.api_type : hit.type]}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

function MarkdownHitContent({ hit }: { hit: MarkdownRecordHit }): ReactElement {
    return (
        <HitContentWithTitle hit={hit}>
            <Breadcrumb breadcrumb={createHierarchyBreadcrumb(hit.breadcrumb, hit.hierarchy, hit.level)} />
            <HitSnippet hit={hit} attribute={hit._highlightResult?.description ? "description" : "content"} />
        </HitContentWithTitle>
    );
}

function ChangelogHitContent({ hit }: { hit: ChangelogRecordHit }): ReactElement {
    const datestring = format(utc(hit.date), "MMM d, yyyy");
    return (
        <HitContentWithTitle hit={hit}>
            <Breadcrumb breadcrumb={[...hit.breadcrumb.map((crumb) => crumb.title), datestring]} />
            <HitSnippet hit={hit} attribute={hit._highlightResult?.description ? "description" : "content"} />
        </HitContentWithTitle>
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

    // const rightTitle = last(hit.breadcrumb)?.title;

    return (
        <HitContentWithTitle
            hit={hit}
            // rightContent={rightTitle && <span className="text-muted-foreground text-sm">{rightTitle}</span>}
        >
            <div className="inline-flex items-baseline gap-1 max-w-full">
                <HttpMethodBadge method={hit.method} size="sm" className="shrink-0" variant="outlined" />
                <span className="fern-search-hit-endpoint-path shrink">{hit.endpoint_path}</span>
            </div>
            <HitSnippet hit={hit} attribute={attribute} />
        </HitContentWithTitle>
    );
}

export function HitSnippet({
    hit,
    attribute,
}: {
    hit: AlgoliaRecordHit;
    attribute?: keyof AlgoliaRecordHit;
}): ReactNode {
    if (!attribute) {
        return false;
    }

    return (
        <Snippet
            attribute={attribute}
            hit={hit}
            classNames={{
                root: "fern-search-hit-snippet",
                highlighted: "fern-search-hit-highlighted",
                nonHighlighted: "fern-search-hit-non-highlighted",
            }}
        />
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
            return false;
        default:
            throw new UnreachableCaseError(hit);
    }
}

function createHierarchyBreadcrumb(
    breadcrumb: { title: string; pathname?: string }[],
    hierarchy: Partial<Record<(typeof headingLevels)[number], { title?: string; id?: string }>> | undefined,
    level: (typeof headingLevels)[number] | undefined,
) {
    const combinedBreadcrumb: string[] = [];

    combinedBreadcrumb.push(...breadcrumb.map((crumb) => crumb.title));

    if (level) {
        headingLevels.slice(0, headingLevels.indexOf(level)).forEach((headingLevel) => {
            const title = hierarchy?.[headingLevel]?.title;
            if (title) {
                combinedBreadcrumb.push(title);
            }
        });
    }

    return combinedBreadcrumb;
}
