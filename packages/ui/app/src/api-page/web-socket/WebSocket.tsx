import { APIV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { Children, FC, HTMLAttributes, ReactNode, useMemo } from "react";
import { Wifi } from "react-feather";
import { PlaygroundButton } from "../../api-playground/PlaygroundButton";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { FernScrollArea } from "../../components/FernScrollArea";
import { useShouldHideFromSsg } from "../../contexts/navigation-context/useNavigationContext";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton";
import {
    ResolvedTypeDefinition,
    ResolvedUndiscriminatedUnionShape,
    ResolvedUndiscriminatedUnionShapeVariant,
    ResolvedWebSocketChannel,
    ResolvedWebSocketMessage,
    unwrapReference,
} from "../../util/resolver";
import { ApiPageDescription } from "../ApiPageDescription";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { EndpointUrlWithOverflow } from "../endpoints/EndpointUrlWithOverflow";
import { TitledExample } from "../examples/TitledExample";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
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
    const fullSlug = joinUrlSlugs(...props.websocket.slug);

    if (useShouldHideFromSsg(fullSlug)) {
        return null;
    }

    return <WebhookContent {...props} />;
};

const WebhookContent: FC<WebSocket.Props> = ({ websocket, isLastInApi, api, types }) => {
    const fullSlug = joinUrlSlugs(...websocket.slug);
    const route = `/${fullSlug}`;

    const { setTargetRef } = useApiPageCenterElement({ slug: fullSlug });

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

    return (
        <div
            className={"scroll-mt-header-height-padded mx-4 md:mx-6 lg:mx-8"}
            ref={setTargetRef}
            data-route={route.toLowerCase()}
        >
            <article
                className={classNames("scroll-mt-header-height max-w-content-width md:max-w-endpoint-width mx-auto", {
                    "border-default border-b mb-px pb-20": !isLastInApi,
                })}
            >
                <header className="space-y-2.5 pt-8">
                    <div>
                        {/* {subpackageTitle != null && (
                                    <div className="t-accent text-xs font-semibold uppercase tracking-wider">
                                        {subpackageTitle}
                                    </div>
                                )} */}
                        <div className="t-accent text-xs font-semibold uppercase tracking-wider">WebSocket</div>
                        <h1 className="my-0 inline-block leading-tight">{websocket.name}</h1>
                    </div>

                    <ApiPageDescription
                        className="mt-4 text-base leading-6"
                        description={websocket.description}
                        isMarkdown={true}
                    />
                </header>
                <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                    <section className="max-w-content-width space-y-12 py-8">
                        <main className="space-y-12">
                            <CardedSection
                                number={1}
                                title={
                                    <span className="inline-flex items-center gap-2">
                                        {"Handshake"}
                                        <span className="bg-tag-default inline-block rounded-full p-1">
                                            <Wifi className="t-muted size-[15px]" strokeWidth={1.5} />
                                        </span>
                                    </span>
                                }
                                route={route}
                                headingElement={
                                    <div className="border-default -mx-2 flex items-center justify-between rounded-xl border px-2 py-1 hover:transition-[background]">
                                        <EndpointUrlWithOverflow
                                            path={websocket.path}
                                            method="GET"
                                            environment={websocket.defaultEnvironment?.baseUrl}
                                            showEnvironment={true}
                                            className="flex-1"
                                        />
                                        <CopyToClipboardButton
                                            className="-mr-1"
                                            content={() =>
                                                `${websocket.defaultEnvironment?.baseUrl}${websocket.path.map((path) => (path.type === "literal" ? path.value : `:${path.key}`)).join("/")}`
                                            }
                                        />
                                    </div>
                                }
                            >
                                {websocket.headers.length > 0 && (
                                    <EndpointSection
                                        title="Headers"
                                        anchorIdParts={["request", "headers"]}
                                        route={route}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.headers.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "headers", parameter.key]}
                                                        route={route}
                                                        description={parameter.description}
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
                                        route={route}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.pathParameters.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "path", parameter.key]}
                                                        route={route}
                                                        description={parameter.description}
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
                                        route={route}
                                    >
                                        <div className="flex flex-col">
                                            {websocket.queryParameters.map((parameter) => (
                                                <div className="flex flex-col" key={parameter.key}>
                                                    <TypeComponentSeparator />
                                                    <EndpointParameter
                                                        name={parameter.key}
                                                        shape={parameter.valueShape}
                                                        anchorIdParts={["request", "query", parameter.key]}
                                                        route={route}
                                                        description={parameter.description}
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
                                            <span className="bg-tag-success t-success inline-block rounded-full p-1">
                                                <ArrowUpIcon />
                                            </span>
                                        </span>
                                    }
                                    anchorIdParts={["send"]}
                                    route={route}
                                    headerType="h2"
                                >
                                    <div className="t-muted border-default border-b text-sm leading-6">
                                        {/* <ApiPageDescription
                                        className="text-sm"
                                        description={websocket.publish.description}
                                        isMarkdown={true}
                                    />
                                    {websocket.publish.description == null &&
                                        `This channel expects ${renderTypeShorthand(websocket.publish.shape, {
                                            withArticle: true,
                                        })}.`} */}
                                    </div>
                                    <TypeReferenceDefinitions
                                        shape={publishMessageShape}
                                        isCollapsible={false}
                                        anchorIdParts={["send"]}
                                        route={route}
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
                                            <span className="bg-tag-primary t-accent-aaa inline-block rounded-full p-1">
                                                <ArrowDownIcon />
                                            </span>
                                        </span>
                                    }
                                    anchorIdParts={["receive"]}
                                    route={route}
                                    headerType="h2"
                                >
                                    <div className="t-muted border-default border-b text-sm leading-6">
                                        {/* <ApiPageDescription
                                        className="text-sm"
                                        description={websocket.subscribe.description}
                                        isMarkdown={true}
                                    />
                                    {`This channel emits ${renderTypeShorthand(websocket.subscribe.shape, {
                                        withArticle: true,
                                    })}.`} */}
                                    </div>
                                    <TypeReferenceDefinitions
                                        shape={subscribeMessageShape}
                                        isCollapsible={false}
                                        anchorIdParts={["receive"]}
                                        route={route}
                                        applyErrorStyles={false}
                                        types={types}
                                    />
                                </EndpointSection>
                            )}
                        </main>
                    </section>
                    <aside className="max-w-content-width">
                        {example != null && example.messages.length > 0 && (
                            <div className="max-h-vh-minus-header scroll-mt-header-height top-header-height flex flex-col gap-6 py-8">
                                <TitledExample
                                    title={"Handshake"}
                                    type={"primary"}
                                    actions={
                                        <PlaygroundButton
                                            state={{
                                                type: "websocket",
                                                webSocketId: websocket.slug.join("/"),
                                                api,
                                            }}
                                        />
                                    }
                                    disableClipboard={true}
                                >
                                    <FernScrollArea>
                                        <div className="flex px-1 py-3">
                                            <table className="min-w-0 flex-1 shrink table-fixed border-separate border-spacing-x-2 whitespace-normal break-words font-mono text-sm">
                                                <tbody>
                                                    <tr>
                                                        <td className="text-left align-top">URL</td>
                                                        <td className="text-left align-top">
                                                            {`${websocket.defaultEnvironment?.baseUrl ?? ""}${example.path ?? ""}`}
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
                                <TitledExample title={"Messages"} type={"primary"} className="min-h-0 shrink">
                                    <FernScrollArea className="rounded-b-[inherit]">
                                        <WebSocketMessages messages={exampleMessages} />
                                    </FernScrollArea>
                                </TitledExample>
                            </div>
                        )}
                    </aside>
                </div>
            </article>
        </div>
    );
};

function CardedSection({
    number: num,
    title,
    headingElement,
    children,
    route,
    ...props
}: {
    number: number;
    title: ReactNode;
    headingElement: ReactNode;
    children: ReactNode | undefined;
    route: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">) {
    const anchorRoute = `${route}#${title}`.toLowerCase();
    return (
        <section
            {...props}
            data-route={anchorRoute}
            className="border-default divide-default -mx-4 divide-y rounded-xl border"
        >
            <div className="bg-tag-default-soft space-y-4 rounded-t-[inherit] p-4 last:rounded-b-[inherit]">
                <h2 className="relative mt-0 flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} />
                    {/* <div className="bg-tag-default mr-2 inline-flex size-7 items-center justify-center rounded-full font-mono text-base">
                        {num}
                    </div> */}
                    <span>{title}</span>
                </h2>
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
