import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { CopyToClipboardButton, FernScrollArea } from "@fern-ui/components";
import cn from "clsx";
import { ArrowDown, ArrowUp, Wifi } from "iconoir-react";
import { Children, FC, HTMLAttributes, ReactNode, useMemo, useRef } from "react";
import { useNavigationNodes, usePlaygroundEnvironment } from "../../atoms";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { FernAnchor } from "../../components/FernAnchor";
import { FernBreadcrumbs } from "../../components/FernBreadcrumbs";
import { useHref } from "../../hooks/useHref";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { Markdown } from "../../mdx/Markdown";
import { PlaygroundButton } from "../../playground/PlaygroundButton";
import {
    ResolvedTypeDefinition,
    ResolvedUndiscriminatedUnionShape,
    ResolvedUndiscriminatedUnionShapeVariant,
    ResolvedWebSocketChannel,
    ResolvedWebSocketMessage,
    getParameterDescription,
    resolveEnvironment,
    stringifyResolvedEndpointPathParts,
    unwrapReference,
} from "../../resolver/types";
import { getSlugFromChildren } from "../../util/getSlugFromText";
import { EndpointAvailabilityTag } from "../endpoints/EndpointAvailabilityTag";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { EndpointUrlWithOverflow } from "../endpoints/EndpointUrlWithOverflow";
import { TitledExample } from "../examples/TitledExample";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebSocketMessage, WebSocketMessages } from "./WebSocketMessages";

export declare namespace WebSocket {
    export interface Props {
        websocket: ResolvedWebSocketChannel;
        isLastInApi: boolean;
        api: string;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const WebSocket: FC<WebSocket.Props> = (props) => {
    if (useShouldLazyRender(props.websocket.slug)) {
        return null;
    }

    return <WebhookContent {...props} />;
};

const WebhookContent: FC<WebSocket.Props> = ({ websocket, isLastInApi, types }) => {
    const nodes = useNavigationNodes();
    const selectedEnvironmentId = useSelectedEnvironmentId();
    const maybeNode = nodes.get(websocket.nodeId);
    const node = maybeNode != null && FernNavigation.isApiLeaf(maybeNode) ? maybeNode : undefined;
    const playgroundEnvironment = usePlaygroundEnvironment();

    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, websocket.slug);

    const publishMessages = useMemo(
        () => websocket.messages.filter((message) => message.origin === APIV1Read.WebSocketMessageOrigin.Client),
        [websocket.messages],
    );
    const subscribeMessages = useMemo(
        () => websocket.messages.filter((message) => message.origin === APIV1Read.WebSocketMessageOrigin.Server),
        [websocket.messages],
    );

    const publishMessageShape = useMemo((): ResolvedUndiscriminatedUnionShape => {
        return {
            type: "undiscriminatedUnion",
            variants: flattenWebSocketShape(publishMessages, types),
            name: undefined,
            description: undefined,
            availability: undefined,
        };
    }, [publishMessages, types]);

    const subscribeMessageShape = useMemo((): ResolvedUndiscriminatedUnionShape => {
        return {
            type: "undiscriminatedUnion",
            variants: flattenWebSocketShape(subscribeMessages, types),
            name: undefined,
            description: undefined,
            availability: undefined,
        };
    }, [subscribeMessages, types]);

    const example = websocket.examples[0];

    const exampleMessages = useMemo((): WebSocketMessage[] => {
        return (
            example?.messages.map((message) => {
                const messageDefinition = websocket.messages.find((m) => m.type === message.type);
                return {
                    type: message.type,
                    data: message.body,
                    origin: messageDefinition?.origin,
                    displayName: messageDefinition?.displayName,
                };
            }) ?? []
        );
    }, [example?.messages, websocket.messages]);

    const headers = websocket.headers.filter((header) => !header.hidden);

    return (
        <div className={"fern-endpoint-content"} ref={ref} id={useHref(websocket.slug)}>
            <article
                className={cn("scroll-mt-content max-w-content-width md:max-w-endpoint-width mx-auto", {
                    "border-default border-b mb-px pb-20": !isLastInApi,
                })}
            >
                <header className="space-y-1 pt-8">
                    <FernBreadcrumbs breadcrumb={websocket.breadcrumb} />
                    <div>
                        <h1 className="fern-page-heading">{websocket.title}</h1>
                        {websocket.availability != null && (
                            <span className="inline-block ml-2 align-text-bottom">
                                <EndpointAvailabilityTag availability={websocket.availability} minimal={true} />
                            </span>
                        )}
                    </div>
                </header>
                <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                    <section className="max-w-content-width space-y-12 py-8">
                        <main className="space-y-12">
                            <Markdown className="mt-4 leading-6" mdx={websocket.description} />

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
                                slug={websocket.slug}
                                headingElement={
                                    <div className="border-default -mx-2 flex items-center justify-between rounded-xl border px-2 py-1 transition-colors">
                                        <EndpointUrlWithOverflow
                                            path={websocket.path}
                                            method="GET"
                                            selectedEnvironment={resolveEnvironment(websocket, selectedEnvironmentId)}
                                            showEnvironment={true}
                                            className="flex-1"
                                        />
                                        <CopyToClipboardButton
                                            className="-mr-1"
                                            content={() =>
                                                `${playgroundEnvironment ?? resolveEnvironment(websocket, selectedEnvironmentId)?.baseUrl}${websocket.path.map((path) => (path.type === "literal" ? path.value : `:${path.key}`)).join("/")}`
                                            }
                                        />
                                    </div>
                                }
                            >
                                {headers.length > 0 && (
                                    <EndpointSection
                                        title="Headers"
                                        anchorIdParts={["request", "headers"]}
                                        slug={websocket.slug}
                                    >
                                        <div className="flex flex-col">
                                            {headers.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "headers", parameter.key]}
                                                        slug={websocket.slug}
                                                        description={getParameterDescription(parameter, types)}
                                                        availability={parameter.availability}
                                                        types={types}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </EndpointSection>
                                )}
                                {websocket.pathParameters.length > 0 && (
                                    <EndpointSection
                                        title="Path parameters"
                                        anchorIdParts={["request", "path"]}
                                        slug={websocket.slug}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.pathParameters.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "path", parameter.key]}
                                                        slug={websocket.slug}
                                                        description={getParameterDescription(parameter, types)}
                                                        availability={parameter.availability}
                                                        types={types}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </EndpointSection>
                                )}
                                {websocket.queryParameters.length > 0 && (
                                    <EndpointSection
                                        title="Query parameters"
                                        anchorIdParts={["request", "query"]}
                                        slug={websocket.slug}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.queryParameters.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "query", parameter.key]}
                                                        slug={websocket.slug}
                                                        description={getParameterDescription(parameter, types)}
                                                        availability={parameter.availability}
                                                        types={types}
                                                    />
                                                </div>
                                            ))}
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
                                    slug={websocket.slug}
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
                                        slug={websocket.slug}
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
                                    slug={websocket.slug}
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
                                        slug={websocket.slug}
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
                                                            {`${playgroundEnvironment ?? resolveEnvironment(websocket, selectedEnvironmentId)?.baseUrl ?? ""}${example?.path ?? stringifyResolvedEndpointPathParts(websocket.path)}`}
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
    subscribeMessages: ResolvedWebSocketMessage[],
    types: Record<string, ResolvedTypeDefinition>,
) {
    return subscribeMessages
        .map((message) => ({ ...message, body: unwrapReference(message.body, types) }))
        .flatMap((message): ResolvedUndiscriminatedUnionShapeVariant[] => {
            if (message.body.type === "undiscriminatedUnion") {
                return message.body.variants;
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
