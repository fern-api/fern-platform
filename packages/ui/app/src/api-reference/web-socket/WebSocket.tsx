import type { WebSocketContext } from "@fern-api/fdr-sdk/api-definition";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { CopyToClipboardButton, FernScrollArea } from "@fern-ui/components";
import { AvailabilityBadge } from "@fern-ui/components/badges";
import cn from "clsx";
import { ArrowDown, ArrowUp, Wifi } from "iconoir-react";
import { Children, FC, HTMLAttributes, ReactNode, useMemo, useRef } from "react";
import { useHref } from "../../atoms";
import { FernAnchor } from "../../components/FernAnchor";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { Markdown } from "../../mdx/Markdown";
import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { usePlaygroundBaseUrl } from "../../playground/utils/select-environment";
import { getSlugFromChildren } from "../../util/getSlugFromText";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { EndpointUrlWithOverflow } from "../endpoints/EndpointUrlWithOverflow";
import { TitledExample } from "../examples/TitledExample";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebSocketMessage, WebSocketMessages } from "./WebSocketMessages";

export interface WebSocketProps {
    node: FernNavigation.WebSocketNode;
    apiDefinition: ApiDefinition.ApiDefinition;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    last?: boolean;
}

export const WebSocket: FC<WebSocketProps> = (props) => {
    const context = useMemo(
        () => ApiDefinition.createWebSocketContext(props.node, props.apiDefinition),
        [props.node, props.apiDefinition],
    );

    if (!context) {
        // eslint-disable-next-line no-console
        console.error("Could not create context for websocket", props.node);
        return null;
    }

    return <WebhookContent context={context} breadcrumb={props.breadcrumb} last={props.last} />;
};

interface WebhookContentProps {
    context: WebSocketContext;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    last?: boolean;
}

const WebhookContent: FC<WebhookContentProps> = ({ context, breadcrumb, last }) => {
    const { channel, node, types, globalHeaders } = context;

    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, node.slug);

    const publishMessages = useMemo(
        () => channel.messages.filter((message) => message.origin === APIV1Read.WebSocketMessageOrigin.Client),
        [channel.messages],
    );
    const subscribeMessages = useMemo(
        () => channel.messages.filter((message) => message.origin === APIV1Read.WebSocketMessageOrigin.Server),
        [channel.messages],
    );

    const publishMessageShape = useMemo((): ApiDefinition.TypeShape.UndiscriminatedUnion => {
        return {
            type: "undiscriminatedUnion",
            variants: flattenWebSocketShape(publishMessages, types),
        };
    }, [publishMessages, types]);

    const subscribeMessageShape = useMemo((): ApiDefinition.TypeShape.UndiscriminatedUnion => {
        return {
            type: "undiscriminatedUnion",
            variants: flattenWebSocketShape(subscribeMessages, types),
        };
    }, [subscribeMessages, types]);

    const example = channel.examples?.[0];

    const exampleMessages = useMemo((): WebSocketMessage[] => {
        return (
            example?.messages?.map((message) => {
                const messageDefinition = channel.messages.find((m) => m.type === message.type);
                return {
                    type: message.type,
                    data: message.body,
                    origin: messageDefinition?.origin,
                    displayName: messageDefinition?.displayName,
                };
            }) ?? []
        );
    }, [example?.messages, channel.messages]);

    const [baseUrl, envId] = usePlaygroundBaseUrl(channel);

    // TODO: combine with auth headers like in Endpoint.tsx
    const headers = useMemo(
        () => [...globalHeaders, ...(channel.requestHeaders ?? [])],
        [channel.requestHeaders, globalHeaders],
    );

    return (
        <div className="fern-endpoint-content" ref={ref} id={useHref(node.slug)}>
            <article
                className={cn("scroll-mt-content max-w-content-width md:max-w-endpoint-width mx-auto", {
                    "border-default border-b mb-px pb-20": !last,
                })}
            >
                <header className="space-y-1 pt-8">
                    <FernBreadcrumbs breadcrumb={breadcrumb} />
                    <div>
                        <h1 className="fern-page-heading">{node.title}</h1>
                        {channel.availability != null && (
                            <span className="inline-block ml-2 align-text-bottom">
                                <AvailabilityBadge availability={channel.availability} rounded />
                            </span>
                        )}
                    </div>
                </header>
                <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                    <section className="max-w-content-width space-y-12 py-8">
                        <main className="space-y-12">
                            <Markdown className="mt-4 leading-6" mdx={channel.description} />

                            <CardedSection
                                number={1}
                                title={
                                    <span className="inline-flex items-center gap-2">
                                        {"Handshake"}
                                        <span className="inline-block rounded-full bg-tag-default p-1">
                                            <Wifi className="t-muted size-icon" strokeWidth={1.5} />
                                        </span>
                                    </span>
                                }
                                slug={node.slug}
                                headingElement={
                                    <div className="border-default -mx-2 flex items-center justify-between rounded-xl border px-2 py-1 transition-colors">
                                        <EndpointUrlWithOverflow
                                            path={channel.path}
                                            method="GET"
                                            baseUrl={baseUrl}
                                            environmentId={envId}
                                            showEnvironment={true}
                                            className="flex-1"
                                        />
                                        <CopyToClipboardButton
                                            className="-mr-1"
                                            content={() =>
                                                `${baseUrl ?? ""}${ApiDefinition.toColonEndpointPathLiteral(channel.path)}`
                                            }
                                        />
                                    </div>
                                }
                            >
                                {headers && headers.length > 0 && (
                                    <EndpointSection
                                        title="Headers"
                                        anchorIdParts={["request", "headers"]}
                                        slug={node.slug}
                                    >
                                        <div className="flex flex-col">
                                            {headers.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "headers", parameter.key]}
                                                        slug={node.slug}
                                                        description={parameter.description}
                                                        additionalDescriptions={
                                                            ApiDefinition.unwrapReference(parameter.valueShape, types)
                                                                .descriptions
                                                        }
                                                        availability={parameter.availability}
                                                        types={types}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </EndpointSection>
                                )}
                                {channel.pathParameters && channel.pathParameters.length > 0 && (
                                    <EndpointSection
                                        title="Path parameters"
                                        anchorIdParts={["request", "path"]}
                                        slug={node.slug}
                                    >
                                        <div className="flex flex-col">
                                            {channel.pathParameters.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "path", parameter.key]}
                                                        slug={node.slug}
                                                        description={parameter.description}
                                                        additionalDescriptions={
                                                            ApiDefinition.unwrapReference(parameter.valueShape, types)
                                                                .descriptions
                                                        }
                                                        availability={parameter.availability}
                                                        types={types}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </EndpointSection>
                                )}
                                {channel.queryParameters && channel.queryParameters.length > 0 && (
                                    <EndpointSection
                                        title="Query parameters"
                                        anchorIdParts={["request", "query"]}
                                        slug={node.slug}
                                    >
                                        <div className="flex flex-col">
                                            {channel.queryParameters.map((parameter) => {
                                                return (
                                                    <div className="flex flex-col" key={parameter.key}>
                                                        <TypeComponentSeparator />
                                                        <EndpointParameter
                                                            name={parameter.key}
                                                            shape={parameter.valueShape}
                                                            anchorIdParts={["request", "query", parameter.key]}
                                                            slug={node.slug}
                                                            description={parameter.description}
                                                            additionalDescriptions={
                                                                ApiDefinition.unwrapReference(
                                                                    parameter.valueShape,
                                                                    types,
                                                                ).descriptions
                                                            }
                                                            availability={parameter.availability}
                                                            types={types}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </EndpointSection>
                                )}
                            </CardedSection>

                            {publishMessages.length > 0 && (
                                <EndpointSection
                                    title={
                                        <span className="inline-flex items-center gap-2">
                                            {"Send"}
                                            <span className="t-success inline-block rounded-full bg-tag-success p-1">
                                                <ArrowUp className="size-icon" />
                                            </span>
                                        </span>
                                    }
                                    anchorIdParts={["send"]}
                                    slug={node.slug}
                                    headerType="h2"
                                >
                                    {/* <Markdown
                                        size="sm"
                                        className="t-muted border-default border-b leading-6"
                                        mdx={websocket.publish.description}
                                        fallback={`This channel expects ${renderDeprecatedTypeShorthand(websocket.publish.shape, {
                                            withArticle: true,
                                        })}.`}
                                    /> */}
                                    <TypeReferenceDefinitions
                                        shape={publishMessageShape}
                                        isCollapsible={false}
                                        anchorIdParts={["send"]}
                                        slug={node.slug}
                                        applyErrorStyles={false}
                                        types={types}
                                    />
                                </EndpointSection>
                            )}
                            {subscribeMessages.length > 0 && (
                                <EndpointSection
                                    title={
                                        <span className="inline-flex items-center gap-2">
                                            {"Receive"}
                                            <span className="t-accent-aaa inline-block rounded-full bg-tag-primary p-1">
                                                <ArrowDown className="size-icon" />
                                            </span>
                                        </span>
                                    }
                                    anchorIdParts={["receive"]}
                                    slug={node.slug}
                                    headerType="h2"
                                >
                                    {/* <Markdown
                                        size="sm"
                                        className="t-muted border-default border-b leading-6"
                                        mdx={websocket.subscribe.description}
                                        fallback={`This channel emits ${renderDeprecatedTypeShorthand(websocket.subscribe.shape, {
                                            withArticle: true,
                                        })}.`}
                                    /> */}
                                    <TypeReferenceDefinitions
                                        shape={subscribeMessageShape}
                                        isCollapsible={false}
                                        anchorIdParts={["receive"]}
                                        slug={node.slug}
                                        applyErrorStyles={false}
                                        types={types}
                                    />
                                </EndpointSection>
                            )}
                        </main>
                    </section>
                    <aside className="max-w-content-width">
                        {
                            <div className="sticky top-header-offset flex max-h-content scroll-mt-content flex-col gap-6 py-8">
                                <TitledExample
                                    title={"Handshake"}
                                    actions={node != null ? <PlaygroundButton state={node} /> : undefined}
                                    disableClipboard={true}
                                >
                                    <FernScrollArea>
                                        <div className="flex px-1 py-3">
                                            <table className="min-w-0 flex-1 shrink table-fixed border-separate border-spacing-x-2 whitespace-normal break-words font-mono text-sm">
                                                <tbody>
                                                    <tr>
                                                        <td className="text-left align-top">URL</td>
                                                        <td className="text-left align-top">
                                                            {`${baseUrl ?? ""}${example?.path ?? ApiDefinition.toColonEndpointPathLiteral(channel.path)}`}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-left align-top">Method</td>
                                                        <td className="text-left align-top">GET</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-left align-top">Status</td>
                                                        <td className="text-left align-top">101 Switching Protocols</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </FernScrollArea>
                                </TitledExample>
                                {exampleMessages.length > 0 && (
                                    <TitledExample title={"Messages"} className="min-h-0 shrink">
                                        <FernScrollArea className="rounded-b-[inherit]">
                                            <WebSocketMessages messages={exampleMessages} />
                                        </FernScrollArea>
                                    </TitledExample>
                                )}
                            </div>
                        }
                    </aside>
                </div>
            </article>
        </div>
    );
};

function CardedSection({
    // number: num,
    title,
    headingElement,
    children,
    slug,
    ...props
}: {
    number: number;
    title: ReactNode;
    headingElement: ReactNode;
    children: ReactNode | undefined;
    slug: FernNavigation.Slug;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">) {
    const href = useHref(slug, getSlugFromChildren(title));
    return (
        <section {...props} id={href} className="border-default divide-default -mx-4 divide-y rounded-xl border">
            <div className="space-y-4 rounded-t-[inherit] bg-tag-default-soft p-4 last:rounded-b-[inherit]">
                <FernAnchor href={href}>
                    <h2 className="relative mt-0 flex items-center">{title}</h2>
                </FernAnchor>
                {headingElement}
            </div>
            {Children.toArray(children).some((child) => child) && <div className="space-y-12 p-4">{children}</div>}
        </section>
    );
}
function flattenWebSocketShape(
    subscribeMessages: ApiDefinition.WebSocketMessage[],
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>,
) {
    return subscribeMessages.flatMap((message): ApiDefinition.UndiscriminatedUnionVariant[] => {
        const unwrapped = ApiDefinition.unwrapReference(message.body, types);
        if (unwrapped.shape.type === "undiscriminatedUnion") {
            return unwrapped.shape.variants;
        }
        return [
            {
                description: message.description,
                availability: message.availability,
                displayName: message.displayName ?? message.type,
                shape: message.body,
            },
        ];
    });
}
