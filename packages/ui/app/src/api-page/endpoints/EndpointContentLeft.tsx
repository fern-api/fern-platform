import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { getEndpointTitleAsString, getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { useAtom } from "jotai";
import { noop } from "lodash-es";
import Image from "next/image";
import { memo, useEffect } from "react";
import { Menu, MenuItem } from "../../docs/Menu";
import { finchProviderAccessTypeAtom, finchProviderIdAtom } from "../../mdx/components/FinchProviderMatrix";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { FinchData } from "../utils/finchData";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointErrorsSection } from "./EndpointErrorsSection";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointRequestSection } from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

export interface HoveringProps {
    isHovering: boolean;
}

export declare namespace EndpointContentLeft {
    export interface Props {
        endpoint: APIV1Read.EndpointDefinition;
        package: APIV1Read.ApiDefinitionPackage;
        anchorIdParts: string[];
        apiSection: DocsV1Read.ApiSection;
        onHoverRequestProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        onHoverResponseProperty: (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void;
        errors: APIV1Read.ErrorDeclarationV2[];
        selectedErrorIndex: number | null;
        setSelectedErrorIndex: (idx: number | null) => void;
        route: string;
    }
}

const UnmemoizedEndpointContentLeft: React.FC<EndpointContentLeft.Props> = ({
    endpoint,
    package: package_,
    anchorIdParts,
    apiSection,
    onHoverRequestProperty,
    onHoverResponseProperty,
    errors,
    selectedErrorIndex,
    setSelectedErrorIndex,
    route,
}) => {
    const [finchProviderId, setFinchProviderId] = useAtom(finchProviderIdAtom);
    const [finchProviderAccessType, setFinchProviderAccessType] = useAtom(finchProviderAccessTypeAtom);
    // const [finchHideUnsupported, setFinchHideUnsupported] = useAtom(finchHideUnsupportedAtom);
    const selectedFinchProvider = finchProviderId != null ? FinchData.integrations[finchProviderId] : undefined;
    useEffect(() => {
        if (selectedFinchProvider != null) {
            setFinchProviderAccessType((prev) => {
                if (prev == null) {
                    return selectedFinchProvider.supportedAccessTypes[0];
                } else {
                    if (selectedFinchProvider.supportedAccessTypes.indexOf(prev) > -1) {
                        return prev;
                    } else {
                        return selectedFinchProvider.supportedAccessTypes[0];
                    }
                }
            });
        }
    }, [finchProviderAccessType, selectedFinchProvider, setFinchProviderAccessType]);
    const provider = (
        <div className="flex space-x-2">
            {/* <div className="my-auto flex items-center space-x-2">
                <span className="text-xs text-black/60">Hide unsupported</span>
                <Switch
                    checked={finchHideUnsupported}
                    onChange={(next) => {
                        setFinchHideUnsupported(next);
                        navigateToPath(route.substring(1));
                    }}
                    className={`${finchHideUnsupported ? "bg-accent-primary" : "bg-accent-primary/50"}
          relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
                >
                    <span className="sr-only">Use setting</span>
                    <span
                        aria-hidden="true"
                        className={`${finchHideUnsupported ? "translate-x-4" : "translate-x-0"}
            pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                    />
                </Switch>
            </div> */}
            <Menu
                text={selectedFinchProvider?.name ?? "Select provider..."}
                icon={
                    selectedFinchProvider?.iconPath != null ? (
                        <Image
                            src={selectedFinchProvider.iconPath}
                            alt={selectedFinchProvider.name}
                            width={16}
                            height={16}
                        />
                    ) : undefined
                }
                menuClassName="w-52"
                align="right"
            >
                {Object.entries(FinchData.integrations).map(([key, integration]) => (
                    <MenuItem key={key} onClick={() => setFinchProviderId(key)}>
                        {integration.iconPath != null ? (
                            <Image src={integration.iconPath} alt={integration.name} width={16} height={16} />
                        ) : (
                            <span style={{ width: 16 }} />
                        )}
                        <span>{integration.name}</span>
                    </MenuItem>
                ))}
            </Menu>
            {selectedFinchProvider != null && (
                <Tab.Group
                    onChange={(index) => setFinchProviderAccessType(selectedFinchProvider.supportedAccessTypes[index])}
                    selectedIndex={
                        finchProviderAccessType != null
                            ? selectedFinchProvider.supportedAccessTypes.indexOf(finchProviderAccessType)
                            : -1
                    }
                >
                    <Tab.List className="flex space-x-1">
                        {selectedFinchProvider.supportedAccessTypes.map((accessType) => (
                            <Tab
                                key={accessType}
                                className={({ selected }) =>
                                    classNames(
                                        "w-full rounded-lg py-1 px-2 font-mono text-xs leading-5 border",
                                        "ring-white/60 ring-offset-2 ring-offset-blue-400 transition",
                                        selected
                                            ? "bg-white text-accent-primary shadow border border-accent-primary"
                                            : "text-accent-primary border-border-primary hover:bg-tag-primary hover:border-2 hover:py-[calc(theme(spacing.1)-1px)] hover:px-[calc(theme(spacing[2])-1px)]"
                                    )
                                }
                            >
                                {accessType === "api" ? "API" : "Credentials"}
                            </Tab>
                        ))}
                    </Tab.List>
                </Tab.Group>
            )}
        </div>
    );
    const requestExpandAll = useBooleanState(false);
    const responseExpandAll = useBooleanState(false);
    const errorExpandAll = useBooleanState(false);
    return (
        <>
            <div className="pb-2 pt-12">
                {isSubpackage(package_) && (
                    <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                        {getSubpackageTitle(package_)}
                    </div>
                )}
                <div>
                    <span className="typography-font-heading text-text-primary-light dark:text-text-primary-dark text-3xl font-bold">
                        {getEndpointTitleAsString(endpoint)}
                    </span>
                    {endpoint.availability != null && (
                        <span className="relative">
                            <EndpointAvailabilityTag
                                className="absolute -top-1.5 left-2.5 inline-block"
                                availability={endpoint.availability}
                            />
                        </span>
                    )}
                </div>
            </div>
            <EndpointUrlWithOverflow endpoint={endpoint} />
            <ApiPageDescription className="mt-3" description={endpoint.description} isMarkdown={true} />
            <div className="mt-8 flex">
                <div className="flex flex-1 flex-col gap-12">
                    {endpoint.path.pathParameters.length > 0 && (
                        <PathParametersSection
                            pathParameters={endpoint.path.pathParameters}
                            anchorIdParts={[...anchorIdParts, "path"]}
                            route={route}
                        />
                    )}
                    {endpoint.headers.length > 0 && (
                        <EndpointSection
                            title="Headers"
                            anchorIdParts={[...anchorIdParts, "headers"]}
                            route={route}
                            showExpandCollapse={false}
                            expandAll={noop}
                            collapseAll={noop}
                        >
                            <div className="flex flex-col">
                                {endpoint.headers.map((header, index) => (
                                    <div className="flex flex-col" key={index}>
                                        <TypeComponentSeparator />
                                        <EndpointParameter
                                            name={header.key}
                                            type={header.type}
                                            anchorIdParts={[...anchorIdParts, "headers", header.key]}
                                            route={route}
                                            description={header.description}
                                            descriptionContainsMarkdown={header.descriptionContainsMarkdown ?? false}
                                            availability={header.availability}
                                        />
                                    </div>
                                ))}
                            </div>
                        </EndpointSection>
                    )}
                    {endpoint.queryParameters.length > 0 && (
                        <QueryParametersSection
                            queryParameters={endpoint.queryParameters}
                            anchorIdParts={[...anchorIdParts, "query"]}
                            route={route}
                        />
                    )}
                    {endpoint.request != null && (
                        <EndpointSection
                            title="Request"
                            anchorIdParts={[...anchorIdParts, "request"]}
                            route={route}
                            expandAll={requestExpandAll.setTrue}
                            collapseAll={requestExpandAll.setFalse}
                            showExpandCollapse={true}
                        >
                            <EndpointRequestSection
                                httpRequest={endpoint.request}
                                onHoverProperty={onHoverRequestProperty}
                                anchorIdParts={[...anchorIdParts, "request"]}
                                route={route}
                                defaultExpandAll={requestExpandAll.value}
                            />
                        </EndpointSection>
                    )}
                    {endpoint.response != null && (
                        <EndpointSection
                            title="Response"
                            anchorIdParts={[...anchorIdParts, "response"]}
                            route={route}
                            floatRightElement={
                                isSubpackage(package_) && ["organization", "payroll"].includes(package_.urlSlug)
                                    ? provider
                                    : undefined
                            }
                            expandAll={responseExpandAll.setTrue}
                            collapseAll={responseExpandAll.setFalse}
                            showExpandCollapse={true}
                        >
                            <EndpointResponseSection
                                httpResponse={endpoint.response}
                                onHoverProperty={onHoverResponseProperty}
                                anchorIdParts={[...anchorIdParts, "response"]}
                                route={route}
                                finchProperties={
                                    isSubpackage(package_)
                                        ? package_.urlSlug === "organization"
                                            ? FinchData.organization.objects[endpoint.urlSlug]
                                            : package_.urlSlug === "payroll"
                                            ? FinchData.payroll.objects[endpoint.urlSlug]
                                            : undefined
                                        : undefined
                                }
                                defaultExpandAll={responseExpandAll.value}
                            />
                        </EndpointSection>
                    )}
                    {apiSection.showErrors && errors.length > 0 && (
                        <EndpointSection
                            title="Errors"
                            anchorIdParts={[...anchorIdParts, "errors"]}
                            route={route}
                            expandAll={errorExpandAll.setTrue}
                            collapseAll={errorExpandAll.setFalse}
                            showExpandCollapse={true}
                        >
                            <EndpointErrorsSection
                                errors={errors}
                                onClickError={(_, idx, event) => {
                                    event.stopPropagation();
                                    setSelectedErrorIndex(idx);
                                }}
                                selectError={(_, idx) => setSelectedErrorIndex(idx)}
                                onHoverProperty={onHoverResponseProperty}
                                selectedErrorIndex={selectedErrorIndex}
                                anchorIdParts={[...anchorIdParts, "errors"]}
                                route={route}
                                defaultExpandAll={errorExpandAll.value}
                            />
                        </EndpointSection>
                    )}
                </div>
            </div>
        </>
    );
};

export const EndpointContentLeft = memo(UnmemoizedEndpointContentLeft);
