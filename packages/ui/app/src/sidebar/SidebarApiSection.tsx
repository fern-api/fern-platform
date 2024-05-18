import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { FernErrorTag } from "@fern-ui/components";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode, joinUrlSlugs } from "@fern-ui/fdr-utils";
import { ActivityLogIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { useAtomValue } from "jotai";
import { isEqual, last, sortBy } from "lodash-es";
import { ReactElement, ReactNode, memo, useCallback, useMemo } from "react";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { API_ARTIFACTS_TITLE } from "../config";
import { useNavigationContext } from "../contexts/navigation-context";
import { Changelog } from "../util/dateUtils";
import { checkSlugStartsWith, useCollapseSidebar } from "./CollapseSidebarContext";
import { SidebarHeading } from "./SidebarHeading";
import { SidebarSlugLink } from "./SidebarLink";
import { FERN_STREAM_ATOM } from "./atom";

export interface SidebarApiSectionProps {
    apiSection: SidebarNode.ApiSection;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    depth: number;
}

export const SidebarApiSection: React.FC<SidebarApiSectionProps> = ({
    registerScrolledToPathListener,
    apiSection,
    depth,
}) => {
    const { selectedSlug } = useCollapseSidebar();

    if (apiSection.isSidebarFlattened) {
        return (
            <li>
                <FlattenedApiSection
                    apiSection={apiSection}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    depth={depth}
                />
            </li>
        );
    }

    return depth === 0 ? (
        <li>
            {apiSection.summaryPage != null ? (
                <SidebarSlugLink
                    className={cn({
                        "mt-6": depth === 0,
                    })}
                    depth={depth}
                    title={apiSection.summaryPage.title}
                    as={"h6"}
                    slug={apiSection.summaryPage.slug}
                    icon={apiSection.summaryPage.icon}
                    hidden={apiSection.summaryPage.hidden}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={isEqual(selectedSlug, apiSection.summaryPage.slug)}
                >
                    <InnerSidebarApiSection
                        apiSection={apiSection}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        depth={depth + 1}
                    />
                </SidebarSlugLink>
            ) : (
                <SidebarHeading
                    className={cn({
                        "mt-6": depth === 0,
                    })}
                    depth={depth}
                    title={apiSection.title}
                    slug={apiSection.slug}
                    icon={apiSection.icon}
                    hidden={apiSection.hidden}
                >
                    <InnerSidebarApiSection
                        apiSection={apiSection}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        depth={depth + 1}
                    />
                </SidebarHeading>
            )}
        </li>
    ) : (
        <ExpandableSidebarApiSection
            apiSection={apiSection}
            registerScrolledToPathListener={registerScrolledToPathListener}
            depth={depth}
            title={apiSection.title}
        />
    );
};

interface InnerSidebarApiSectionProps extends SidebarApiSectionProps {
    className?: string;
}

const InnerSidebarApiSection = memo<InnerSidebarApiSectionProps>(function InnerSidebarApiSection({
    className,
    registerScrolledToPathListener,
    depth,
    apiSection,
}) {
    const { selectedSlug } = useCollapseSidebar();
    const renderArtifacts = () => {
        if (apiSection.artifacts == null || !areApiArtifactsNonEmpty(apiSection.artifacts)) {
            return null;
        }
        const clientLibrariesSlug = [...apiSection.slug, "client-libraries"];
        return (
            <SidebarSlugLink
                slug={clientLibrariesSlug}
                title={API_ARTIFACTS_TITLE}
                registerScrolledToPathListener={registerScrolledToPathListener}
                selected={isEqual(clientLibrariesSlug, selectedSlug)}
                depth={Math.max(0, depth - 1)}
                hidden={false}
            />
        );
    };

    if (
        apiSection.items.length === 0 &&
        (apiSection.artifacts == null || areApiArtifactsNonEmpty(apiSection.artifacts))
    ) {
        return null;
    }

    return (
        <ul className={cn(className, "fern-sidebar-group")}>
            {renderArtifacts()}
            {apiSection.items.map((item) =>
                item.type === "apiSection" ? (
                    <ExpandableSidebarApiSection
                        key={joinUrlSlugs(...item.slug)}
                        title={item.title}
                        apiSection={item}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        depth={depth}
                    />
                ) : (
                    <SidebarApiSlugLink
                        key={joinUrlSlugs(...item.slug)}
                        item={item}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        depth={depth}
                        api={apiSection.api}
                    />
                ),
            )}
            {apiSection.changelog != null && (
                <SidebarSlugLink
                    slug={apiSection.changelog.slug}
                    title={apiSection.changelog.title}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={isEqual(apiSection.changelog.slug, selectedSlug)}
                    depth={Math.max(0, depth - 1)}
                    icon={apiSection.changelog.icon ?? <ActivityLogIcon />}
                    rightElement={
                        shouldShowIndicator(apiSection.changelog) && (
                            <span className="relative flex size-2">
                                <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-75"></span>
                                <span className="bg-accent relative inline-flex size-2 rounded-full"></span>
                            </span>
                        )
                    }
                    tooltipContent={renderChangelogTooltip(apiSection.changelog)}
                    hidden={apiSection.changelog.hidden}
                />
            )}
        </ul>
    );
});

interface SidebarApiSlugLinkProps {
    item: SidebarNode.Page | SidebarNode.ApiPage;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    depth: number;
    api: FdrAPI.ApiId;
}

function SidebarApiSlugLink({ item, registerScrolledToPathListener, depth, api }: SidebarApiSlugLinkProps) {
    const isStream = useAtomValue(FERN_STREAM_ATOM);
    const { selectedSlug } = useCollapseSidebar();
    const { activeNavigatable } = useNavigationContext();
    const shallow =
        activeNavigatable != null && SidebarNode.isApiPage(activeNavigatable) && activeNavigatable.api === api;

    const itemSlug = SidebarNode.isEndpointPage(item) && item.stream != null && isStream ? item.stream.slug : item.slug;

    const selected = isEqual(itemSlug, selectedSlug);

    const httpMethodTags: Record<APIV1Read.HttpMethod, ReactElement> = {
        GET: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Get} size="sm" active={selected} />,
        POST: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Post} size="sm" active={selected} />,
        PUT: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Put} size="sm" active={selected} />,
        PATCH: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Patch} size="sm" active={selected} />,
        DELETE: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Delete} size="sm" active={selected} />,
    };
    return (
        <SidebarSlugLink
            className={cn({
                "first:mt-6": depth === 0,
            })}
            slug={itemSlug}
            shallow={shallow}
            title={item.title}
            registerScrolledToPathListener={registerScrolledToPathListener}
            selected={selected}
            depth={Math.max(0, depth - 1)}
            rightElement={
                SidebarNode.isApiPage(item) ? (
                    item.apiType === "endpoint" ? (
                        item.stream && isStream ? (
                            <HttpMethodTag method="STREAM" size="sm" active={selected} />
                        ) : (
                            httpMethodTags[item.method]
                        )
                    ) : item.apiType === "websocket" ? (
                        <HttpMethodTag method="WSS" size="sm" active={selected} />
                    ) : null
                ) : null
            }
            icon={item.icon}
            hidden={item.hidden}
        />
    );
}

function shouldShowIndicator(changelog: SidebarNode.ChangelogPage): boolean {
    // if latest change was within the last 7 days
    const latestChange = last(sortBy(changelog.items, "date"));
    if (latestChange == null) {
        return false;
    }

    return Changelog.withinLastWeek(latestChange.date) || Changelog.isFutureDate(latestChange.date);
}

function renderChangelogTooltip(changelog: SidebarNode.ChangelogPage): ReactNode {
    const latestChange = last(sortBy(changelog.items, "date"));

    if (latestChange == null) {
        return null;
    }

    return `Last updated ${Changelog.toCalendarDate(latestChange.date)}`;
}

interface ExpandableSidebarApiSectionProps extends InnerSidebarApiSectionProps {
    className?: string;
    title: string;
}

export const ExpandableSidebarApiSection: React.FC<ExpandableSidebarApiSectionProps> = ({
    className,
    title,
    registerScrolledToPathListener,
    depth,
    apiSection,
}) => {
    const { checkExpanded, toggleExpanded, selectedSlug } = useCollapseSidebar();
    const expanded = checkExpanded(apiSection.slug);

    const children = useMemo(
        () => (
            <InnerSidebarApiSection
                className={cn("expandable", { hidden: !expanded })}
                registerScrolledToPathListener={registerScrolledToPathListener}
                depth={depth + 1}
                apiSection={apiSection}
            />
        ),
        [apiSection, depth, expanded, registerScrolledToPathListener],
    );

    return (
        <SidebarSlugLink
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(apiSection.slug), [apiSection.slug, toggleExpanded])}
            showIndicator={selectedSlug != null && checkSlugStartsWith(selectedSlug, apiSection.slug) && !expanded}
            icon={apiSection.icon}
            hidden={apiSection.hidden}
            slug={apiSection.summaryPage != null ? apiSection.slug : undefined}
        >
            {children}
        </SidebarSlugLink>
    );
};

function FlattenedApiSection({ apiSection, registerScrolledToPathListener, depth }: SidebarApiSectionProps) {
    return (
        <ul className="fern-sidebar-group">
            {apiSection.items.map((item) =>
                visitDiscriminatedUnion(item, "type")._visit({
                    apiSection: (item) => (
                        <SidebarApiSection
                            key={item.id}
                            apiSection={item}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            depth={depth}
                        />
                    ),
                    page: (item) => (
                        <SidebarApiSlugLink
                            key={joinUrlSlugs(...item.slug)}
                            item={item}
                            api={apiSection.api}
                            registerScrolledToPathListener={registerScrolledToPathListener}
                            depth={depth}
                        />
                    ),
                    _other: () => (
                        <FernErrorTag component="SidebarApiSection" error="Tried to render unknown api section." />
                    ),
                }),
            )}
        </ul>
    );
}
