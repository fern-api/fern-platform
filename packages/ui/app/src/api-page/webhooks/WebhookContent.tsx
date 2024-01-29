import { ResolvedWebhookDefinition } from "@fern-ui/app-utils";
import classNames from "classnames";
import React, { useCallback } from "react";
import { ApiPageDescription } from "../ApiPageDescription";
import { EndpointParameter } from "../endpoints/EndpointParameter";
import { EndpointSection } from "../endpoints/EndpointSection";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { useWebhookContext } from "./webhook-context/useWebhookContext";
import { WebhookExample } from "./webhook-examples/WebhookExample";
import { WebhookPayloadSection } from "./WebhookPayloadSection";
import { WebhookResponseSection } from "./WebhookResponseSection";

export declare namespace WebhookContent {
    export interface Props {
        webhook: ResolvedWebhookDefinition;
        subpackageTitle: string | undefined;
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
        route: string;
        maxContentWidth: string;
    }
}

export const WebhookContent = React.memo<WebhookContent.Props>(function WebhookContent({
    webhook,
    subpackageTitle,
    hideBottomSeparator = false,
    setContainerRef,
    route,
    maxContentWidth,
}) {
    const { setHoveredPayloadPropertyPath } = useWebhookContext();
    const onHoverPayloadProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredPayloadPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredPayloadPropertyPath]
    );

    const example = webhook.examples[0]; // TODO: Need a way to show all the examples

    const webhookExample = example ? <WebhookExample example={example} /> : null;

    return (
        <ApiPageMargins
            className={classNames(
                "pl-6 md:pl-12 pr-4",
                "bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg mb-3 mx-3 lg:ml-0",
                {
                    "border-border-default-light dark:border-border-default-dark border-b": !hideBottomSeparator,
                }
            )}
        >
            <div
                className="flex min-w-0 flex-1 scroll-mt-[74px] flex-col lg:flex-row lg:space-x-[4vw]"
                ref={setContainerRef}
                data-route={route.toLowerCase()}
            >
                <div className="flex min-w-0 flex-1 flex-col pb-10" style={{ maxWidth: maxContentWidth }}>
                    <div className="space-y-2.5 py-8">
                        {subpackageTitle != null && (
                            <div className="text-accent-primary dark:text-accent-primary-dark text-xs font-semibold uppercase tracking-wider">
                                {subpackageTitle}
                            </div>
                        )}
                        <h1 className="inline-block">{webhook.name}</h1>
                    </div>
                    <ApiPageDescription
                        description={webhook.description}
                        isMarkdown={true}
                        className="text-sm leading-6"
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
                                                    shape={parameter.shape}
                                                    anchorIdParts={["payload", "header", parameter.key]}
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
                        "flex-1 sticky self-start top-16 min-w-sm max-w-lg ml-auto",
                        // the py-10 is the same as the 40px below
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-[calc(100vh-4rem)]",
                        // hide on mobile,
                        "hidden lg:flex"
                    )}
                >
                    {webhookExample}
                </div>

                <div className="mt-10 flex max-h-[150vh] lg:mt-0 lg:hidden">{webhookExample}</div>
            </div>
        </ApiPageMargins>
    );
});
