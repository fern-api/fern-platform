import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { SidebarNode, joinUrlSlugs } from "@fern-ui/fdr-utils";
import { ActivityLogIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { isEqual, last, sortBy } from "lodash-es";
import moment from "moment";
import { ReactElement, ReactNode, memo, useCallback, useMemo } from "react";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { StreamTag } from "../commons/withStream";
import { FernTooltip } from "../components/FernTooltip";
import { API_ARTIFACTS_TITLE } from "../config";
import { useNavigationContext } from "../contexts/navigation-context";
import { checkSlugStartsWith, useCollapseSidebar } from "./CollapseSidebarContext";
import { SidebarSlugLink } from "./SidebarLink";

export interface SidebarApiSectionProps {
    className?: string;
    apiSection: SidebarNode.ApiSection;
    slug: readonly string[];
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    depth: number;
}

export const SidebarApiSection: React.FC<SidebarApiSectionProps> = ({
    className,
    slug,
    registerScrolledToPathListener,
    apiSection,
    depth,
}) => {
    return (
        <InnerSidebarApiSection
            className={className}
            slug={slug}
            registerScrolledToPathListener={registerScrolledToPathListener}
            artifacts={apiSection.artifacts}
            depth={depth}
            apiSection={apiSection}
        />
    );
};

interface InnerSidebarApiSectionProps extends SidebarApiSectionProps {
    artifacts: DocsV1Read.ApiArtifacts | undefined;
}

const HTTP_METHOD_TAGS: Record<APIV1Read.HttpMethod, ReactElement> = {
    GET: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Get} small />,
    POST: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Post} small />,
    PUT: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Put} small />,
    PATCH: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Patch} small />,
    DELETE: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Delete} small />,
};

const InnerSidebarApiSection = memo<InnerSidebarApiSectionProps>(function InnerSidebarApiSection({
    className,
    slug,
    registerScrolledToPathListener,
    artifacts,
    depth,
    apiSection,
}) {
    const { selectedSlug } = useCollapseSidebar();
    const { activeNavigatable } = useNavigationContext();
    const shallow =
        activeNavigatable != null &&
        SidebarNode.isApiPage(activeNavigatable) &&
        activeNavigatable.api === apiSection.api;
    const renderArtifacts = () => {
        if (artifacts == null || !areApiArtifactsNonEmpty(artifacts)) {
            return null;
        }
        const clientLibrariesSlug = [...slug, "client-libraries"];
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

    if (apiSection.items.length === 0 && (artifacts == null || areApiArtifactsNonEmpty(artifacts))) {
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
                        slug={item.slug}
                        apiSection={item}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        depth={depth}
                        artifacts={undefined}
                    />
                ) : (
                    <SidebarSlugLink
                        key={joinUrlSlugs(...item.slug)}
                        slug={item.slug}
                        shallow={shallow}
                        title={item.title}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        selected={isEqual(item.slug, selectedSlug)}
                        depth={Math.max(0, depth - 1)}
                        rightElement={
                            item.apiType === "endpoint" ? (
                                item.stream ? (
                                    <StreamTag small />
                                ) : (
                                    HTTP_METHOD_TAGS[item.method]
                                )
                            ) : item.apiType === "websocket" ? (
                                <FernTooltip content="WebSocket Channel">
                                    <span className="rounded-md font-mono text-xs uppercase leading-none">wss</span>
                                </FernTooltip>
                            ) : null
                        }
                        icon={item.icon}
                        hidden={item.hidden}
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

function shouldShowIndicator(changelog: SidebarNode.ChangelogPage): boolean {
    // if latest change was within the last 7 days
    const latestChange = last(sortBy(changelog.items, "date"));
    if (latestChange == null) {
        return false;
    }

    return moment().diff(latestChange.date, "days") <= 7;
}

function renderChangelogTooltip(changelog: SidebarNode.ChangelogPage): ReactNode {
    const latestChange = last(sortBy(changelog.items, "date"));

    if (latestChange == null) {
        return null;
    }

    return `Last updated ${moment(latestChange.date).fromNow()}`;
}

interface ExpandableSidebarApiSectionProps extends InnerSidebarApiSectionProps {
    className?: string;
    title: string;
}

export const ExpandableSidebarApiSection: React.FC<ExpandableSidebarApiSectionProps> = ({
    className,
    title,
    slug,
    registerScrolledToPathListener,
    depth,
    artifacts,
    apiSection,
}) => {
    const { checkExpanded, toggleExpanded, selectedSlug } = useCollapseSidebar();
    const expanded = checkExpanded(slug);

    const children = useMemo(
        () => (
            <InnerSidebarApiSection
                className={cn("expandable", { hidden: !expanded })}
                slug={slug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                depth={depth + 1}
                artifacts={artifacts}
                apiSection={apiSection}
            />
        ),
        [apiSection, artifacts, depth, expanded, registerScrolledToPathListener, slug],
    );

    return (
        <SidebarSlugLink
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(slug), [slug, toggleExpanded])}
            showIndicator={selectedSlug != null && checkSlugStartsWith(selectedSlug, slug) && !expanded}
            icon={apiSection.icon}
            hidden={apiSection.hidden}
        >
            {children}
        </SidebarSlugLink>
    );
};
