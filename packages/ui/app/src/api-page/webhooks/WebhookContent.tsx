import classNames from "classnames";
import React, { useCallback } from "react";
import { ResolvedTypeDefinition, ResolvedWebhookDefinition } from "../../util/resolver";
import { ApiPageDescription } from "../ApiPageDescription";
import { Breadcrumbs } from "../Breadcrumbs";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { useWebhookContext } from "./webhook-context/useWebhookContext";
import { WebhookExample } from "./webhook-examples/WebhookExample";
import { WebhookPayloadSection } from "./WebhookPayloadSection";
import { WebhookResponseSection } from "./WebhookResponseSection";

export declare namespace WebhookContent {
    export interface Props {
        webhook: ResolvedWebhookDefinition;
        breadcrumbs: string[];
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
        route: string;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const WebhookContent = React.memo<WebhookContent.Props>(function WebhookContent({
    webhook,
    breadcrumbs,
    hideBottomSeparator = false,
    setContainerRef,
    route,
    types,
}) {
    const { setHoveredPayloadPropertyPath } = useWebhookContext();
    const onHoverPayloadProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredPayloadPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredPayloadPropertyPath],
    );

    const example = webhook.examples[0]; // TODO: Need a way to show all the examples

    const webhookExample = example ? <WebhookExample example={example} /> : null;

    return (
        <div className={"scroll-mt-header-height-padded mx-4 md:mx-6 lg:mx-8"}>
            <div
                className={classNames(
                    "scroll-mt-header-height max-w-content-width md:max-w-endpoint-width mx-auto md:grid md:grid-cols-2 md:gap-8 lg:gap-12",
                    {
                        "border-default border-b mb-px pb-20": !hideBottomSeparator,
                    },
                )}
                ref={setContainerRef}
                data-route={route.toLowerCase()}
            >
                <div className="max-w-content-width flex min-w-0 flex-1 flex-col">
                    <div className="space-y-1 py-8">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                        <h1 className="my-0 inline-block">{webhook.name}</h1>
                    </div>
                    <ApiPageDescription
                        className="text-base leading-6"
                        description={webhook.description}
                        isMarkdown={true}
                    />
                    {webhook.headers.length > 0 && (
                        <div className="mt-8 flex">
                            <div className="flex max-w-full flex-1 flex-col gap-12">
                                <EndpointSection title="Headers" anchorIdParts={["payload", "header"]} route={route}>
                                    <div className="flex flex-col">
                                        {webhook.headers.map((parameter) => (
                                            <div className="flex flex-col" key={parameter.key}>
                                                <TypeComponentSeparator />
                                                <EndpointParameter
                                                    name={parameter.key}
                                                    shape={parameter.valueShape}
                                                    anchorIdParts={["payload", "header", parameter.key]}
                                                    route={route}
                                                    description={parameter.description}
                                                    availability={parameter.availability}
                                                    types={types}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </EndpointSection>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex">
                        <div className="flex max-w-full flex-1 flex-col gap-12">
                            <EndpointSection title="Payload" anchorIdParts={["payload"]} route={route}>
                                <WebhookPayloadSection
                                    payload={webhook.payload}
                                    onHoverProperty={onHoverPayloadProperty}
                                    anchorIdParts={["payload", "body"]}
                                    route={route}
                                    types={types}
                                />
                            </EndpointSection>
                        </div>
                    </div>

                    <div className="mt-8 flex">
                        <div className="flex max-w-full flex-1 flex-col gap-12">
                            <EndpointSection title="Response" anchorIdParts={["response"]} route={route}>
                                <WebhookResponseSection />
                            </EndpointSection>
                        </div>
                    </div>
                </div>
                <div
                    className={classNames(
                        "max-w-content-width",
                        "flex-1 sticky self-start top-header-height",
                        // the py-10 is the same as the 40px below
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-vh-minus-header",
                        // hide on mobile,
                        "hidden md:flex",
                    )}
                >
                    {webhookExample}
                </div>

                <div className="mt-10 flex max-h-[150vh] md:mt-0 md:hidden">{webhookExample}</div>
            </div>
        </div>
    );
});
