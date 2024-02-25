import { APIV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { Children, FC, HTMLAttributes, ReactNode, useMemo } from "react";
import { Wifi } from "react-feather";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import { FernSyntaxHighlighter } from "../../commons/FernSyntaxHighlighter";
import { useShouldHideFromSsg } from "../../navigation-context/useNavigationContext";
import {
    ResolvedUndiscriminatedUnionShape,
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

export declare namespace WebSocket {
    export interface Props {
        websocket: ResolvedWebSocketChannel;
        isLastInApi: boolean;
    }
}
export const WebSocket: FC<WebSocket.Props> = (props) => {
    const fullSlug = joinUrlSlugs(...props.websocket.slug);

    if (useShouldHideFromSsg(fullSlug)) {
        return null;
    }

    return <WebhookContent {...props} />;
};

const WebhookContent: FC<WebSocket.Props> = ({ websocket, isLastInApi }) => {
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
            variants: flattenWebSocketShape(publishMessages),
        };
    }, [publishMessages]);

    const subscribeMessageShape = useMemo((): ResolvedUndiscriminatedUnionShape => {
        return {
            type: "undiscriminatedUnion",
            variants: flattenWebSocketShape(subscribeMessages),
        };
    }, [subscribeMessages]);

    const example = websocket.examples[0];

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
                        <h1 className="my-0 inline-block">{websocket.name}</h1>
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
                                                        descriptionContainsMarkdown={
                                                            parameter.descriptionContainsMarkdown ?? true
                                                        }
                                                        availability={parameter.availability}
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
                                                        descriptionContainsMarkdown={
                                                            parameter.descriptionContainsMarkdown ?? false
                                                        }
                                                        availability={parameter.availability}
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
                                    />
                                </EndpointSection>
                            )}
                        </main>
                    </section>
                    <aside className="max-w-content-width">
                        {example != null && example.messages.length > 0 && (
                            <div className="max-h-vh-minus-header scroll-mt-header-height top-header-height sticky space-y-6 py-8">
                                <TitledExample title={"Handshake"} type={"primary"} disableClipboard={true}>
                                    <div className="flex px-1 py-3">
                                        <table className="min-w-0 flex-1 shrink table-fixed border-separate border-spacing-x-2 whitespace-normal break-words">
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
                                </TitledExample>
                                <TitledExample title={"Messages"} type={"primary"}>
                                    <Accordion.Root type="multiple" className="divide-border-default divide-y">
                                        {websocket.examples[0]?.messages.map((message, index) => {
                                            const messageType = websocket.messages.find((m) => m.type === message.type);
                                            if (messageType == null) {
                                                // eslint-disable-next-line no-console
                                                console.error(
                                                    `Error: websocket (${websocket.name}) message type not found: ${message.type}`,
                                                );
                                                return null;
                                            }
                                            return (
                                                <Accordion.Item
                                                    value={index.toString()}
                                                    key={index}
                                                    className={classNames(
                                                        "divide-border-default group divide-y focus-within:ring-1 ring-inset last:rounded-b-xl",
                                                        {
                                                            "focus-within:ring-border-success":
                                                                messageType.origin ===
                                                                APIV1Read.WebSocketMessageOrigin.Client,
                                                            "focus-within:ring-border-primary":
                                                                messageType.origin ===
                                                                APIV1Read.WebSocketMessageOrigin.Server,
                                                        },
                                                    )}
                                                >
                                                    <Accordion.Trigger
                                                        className={classNames(
                                                            "w-full flex items-center gap-2 px-3 py-2 hover:data-[state=closed]:bg-tag-default cursor-default transition-background",
                                                            {
                                                                "data-[state=open]:bg-tag-success":
                                                                    messageType.origin ===
                                                                    APIV1Read.WebSocketMessageOrigin.Client,
                                                                "data-[state=open]:bg-tag-primary":
                                                                    messageType.origin ===
                                                                    APIV1Read.WebSocketMessageOrigin.Server,
                                                            },
                                                        )}
                                                    >
                                                        {messageType.origin ===
                                                        APIV1Read.WebSocketMessageOrigin.Client ? (
                                                            <span className="bg-tag-success t-success inline-block shrink-0 rounded-full p-0.5">
                                                                <ArrowUpIcon />
                                                            </span>
                                                        ) : (
                                                            <span className="bg-tag-primary t-accent-aaa inline-block shrink-0 rounded-full p-0.5">
                                                                <ArrowDownIcon />
                                                            </span>
                                                        )}
                                                        <span className="min-w-0 shrink truncate text-xs">
                                                            {JSON.stringify(message.body)}
                                                        </span>
                                                        <span
                                                            className={classNames("flex-1 inline-flex justify-end", {
                                                                // "justify-start": event.action === "send",
                                                                // "justify-end": event.action === "recieve",
                                                            })}
                                                        >
                                                            <span className="bg-tag-default t-muted h-5 rounded-md px-1.5 py-1 text-xs leading-none">
                                                                {messageType.displayName ?? messageType.type}
                                                            </span>
                                                        </span>

                                                        <ChevronDownIcon
                                                            className="t-muted shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                                                            aria-hidden
                                                        />
                                                    </Accordion.Trigger>
                                                    <Accordion.Content className="data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up overflow-hidden">
                                                        <div className="group/cb-container relative">
                                                            <CopyToClipboardButton
                                                                className={
                                                                    "absolute right-1 top-1 opacity-0 transition group-hover/cb-container:opacity-100"
                                                                }
                                                                content={() => JSON.stringify(message.body, null, 2)}
                                                            />
                                                            <FernSyntaxHighlighter
                                                                className="max-h-[200px] w-0 min-w-full overflow-y-auto py-1"
                                                                code={JSON.stringify(message.body, null, 2)}
                                                                language="json"
                                                            />
                                                        </div>
                                                    </Accordion.Content>
                                                </Accordion.Item>
                                            );
                                        })}
                                    </Accordion.Root>
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
            className="border-default divide-border-default -mx-4 divide-y rounded-xl border shadow-xl shadow-black/5 dark:shadow-white/[0.03]"
        >
            <div className="space-y-4 rounded-t-[inherit] bg-black/[0.03] p-4 last:rounded-b-[inherit] dark:bg-white/5">
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
function flattenWebSocketShape(subscribeMessages: ResolvedWebSocketMessage[]) {
    return subscribeMessages
        .map((message) => ({ ...message, body: unwrapReference(message.body) }))
        .flatMap((message) => {
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
