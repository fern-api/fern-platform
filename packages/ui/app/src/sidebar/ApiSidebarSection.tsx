import { Collapse } from "@blueprintjs/core";
import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import {
    doesSubpackageHaveEndpointsOrWebhooksRecursive,
    getEndpointTitleAsString,
    getSubpackageTitle,
    joinUrlSlugs,
} from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import { resolveSubpackage } from "../api-context/ApiDefinitionContextProvider";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { API_ARTIFACTS_TITLE } from "../config";
import { SidebarLink } from "./SidebarLink";

export interface ApiSidebarSectionProps {
    className?: string;
    apiSection: DocsV1Read.ApiSection;
    slug: string;
    selectedSlug: string | undefined;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    closeMobileSidebar: () => void;
    resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition;
    depth: number;
}

export const ApiSidebarSection: React.FC<ApiSidebarSectionProps> = ({
    className,
    slug,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    apiSection,
    resolveApi,
    depth,
}) => {
    const apiDefinition = useMemo(() => resolveApi(apiSection.api), [apiSection.api, resolveApi]);
    const resolveSubpackageById = useCallback(
        (subpackageId: APIV1Read.SubpackageId): APIV1Read.ApiDefinitionSubpackage => {
            return resolveSubpackage(apiDefinition, subpackageId);
        },
        [apiDefinition]
    );
    return (
        <InnerApiSidebarSection
            className={className}
            apiDefinitionPackage={apiDefinition.rootPackage}
            resolveSubpackageById={resolveSubpackageById}
            slug={slug}
            selectedSlug={selectedSlug}
            registerScrolledToPathListener={registerScrolledToPathListener}
            closeMobileSidebar={closeMobileSidebar}
            artifacts={apiSection.artifacts}
            resolveApi={resolveApi}
            depth={depth}
        />
    );
};

interface InnerApiSidebarSectionProps extends Omit<ApiSidebarSectionProps, "apiSection"> {
    apiDefinitionPackage: APIV1Read.ApiDefinitionPackage;
    resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage;
    artifacts?: DocsV1Read.ApiArtifacts;
}

const InnerApiSidebarSection: React.FC<InnerApiSidebarSectionProps> = ({
    className,
    apiDefinitionPackage,
    resolveSubpackageById,
    slug,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    artifacts,
    resolveApi,
    depth,
}) => {
    const renderArtifacts = () => {
        if (artifacts == null || !areApiArtifactsNonEmpty(artifacts)) {
            return null;
        }
        const clientLibrariesSlug = joinUrlSlugs(slug, "client-libraries");
        return (
            <li>
                <SidebarLink
                    onClick={closeMobileSidebar}
                    slug={clientLibrariesSlug}
                    title={API_ARTIFACTS_TITLE}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={clientLibrariesSlug === selectedSlug}
                    depth={Math.max(0, depth - 1)}
                />
            </li>
        );
    };
    return (
        <ul className={classNames(className, "list-none")}>
            {renderArtifacts()}
            {apiDefinitionPackage.endpoints.map((endpoint) => {
                const fullSlug = joinUrlSlugs(slug, endpoint.urlSlug);
                return (
                    <SidebarLink
                        key={endpoint.id}
                        onClick={closeMobileSidebar}
                        slug={fullSlug}
                        title={getEndpointTitleAsString(endpoint)}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        selected={fullSlug === selectedSlug}
                        depth={Math.max(0, depth - 1)}
                        rightElement={<HttpMethodTag className="ml-2 font-normal" method={endpoint.method} small />}
                    />
                );
            })}
            {apiDefinitionPackage.webhooks.map((webhook) => {
                const fullSlug = joinUrlSlugs(slug, webhook.urlSlug);
                return (
                    <SidebarLink
                        key={webhook.id}
                        onClick={closeMobileSidebar}
                        slug={fullSlug}
                        title={webhook.name ?? "/" + webhook.path.join("/")}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        selected={fullSlug === selectedSlug}
                        depth={Math.max(0, depth - 1)}
                    />
                );
            })}
            {apiDefinitionPackage.subpackages.map((subpackageId) => {
                const subpackage = resolveSubpackageById(subpackageId);
                if (!doesSubpackageHaveEndpointsOrWebhooksRecursive(subpackageId, resolveSubpackageById)) {
                    return null;
                }
                const subpackageSlug = joinUrlSlugs(slug, subpackage.urlSlug);
                return (
                    <ExpandableApiSidebarSection
                        key={subpackageId}
                        title={getSubpackageTitle(subpackage)}
                        slug={subpackageSlug}
                        apiDefinitionPackage={subpackage}
                        resolveSubpackageById={resolveSubpackageById}
                        selectedSlug={selectedSlug}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        closeMobileSidebar={closeMobileSidebar}
                        resolveApi={resolveApi}
                        depth={depth}
                    />
                );
            })}
        </ul>
    );
};

interface ExpandableApiSidebarSectionProps extends InnerApiSidebarSectionProps {
    className?: string;
    title: string;
}

const ExpandableApiSidebarSection: React.FC<ExpandableApiSidebarSectionProps> = ({
    className,
    title,
    slug,
    selectedSlug,
    registerScrolledToPathListener,
    closeMobileSidebar,
    resolveApi,
    depth,
    apiDefinitionPackage,
    resolveSubpackageById,
    artifacts,
}) => {
    const {
        value: expanded,
        setTrue: setExpanded,
        toggleValue: toggleExpand,
    } = useBooleanState(selectedSlug?.startsWith(slug) ?? false);

    useEffect(() => {
        if (selectedSlug?.startsWith(slug)) {
            setExpanded();
        }
    }, [selectedSlug, setExpanded, slug]);

    return (
        <SidebarLink
            className={className}
            slug={slug}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            onClick={() => {
                if (!expanded) {
                    setExpanded();
                }
                closeMobileSidebar();
            }}
            title={title}
            expanded={expanded}
            toggleExpand={toggleExpand}
            showIndicator={selectedSlug?.startsWith(slug) && !expanded}
        >
            <Collapse isOpen={expanded} transitionDuration={0} keepChildrenMounted={true}>
                <InnerApiSidebarSection
                    slug={slug}
                    selectedSlug={selectedSlug}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    closeMobileSidebar={closeMobileSidebar}
                    resolveApi={resolveApi}
                    depth={depth + 1}
                    apiDefinitionPackage={apiDefinitionPackage}
                    resolveSubpackageById={resolveSubpackageById}
                    artifacts={artifacts}
                />
            </Collapse>
        </SidebarLink>
    );
};
