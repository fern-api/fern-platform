import * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import { getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import classNames from "classnames";
import { snakeCase } from "lodash-es";
import React, { useCallback } from "react";
import { HEADER_HEIGHT } from "../../constants";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useWebhookContext } from "./webhook-context/useWebhookContext";
import { WebhookExample } from "./webhook-examples/WebhookExample";
import { WebhookHeadersSection } from "./WebhookHeadersSection";
import { WebhookPayloadSection } from "./WebhookPayloadSection";
import { WebhookResponseSection } from "./WebhookResponseSection";
import { WebhookSection } from "./WebhookSection";

export declare namespace WebhookContent {
    export interface Props {
        webhook: FernRegistryApiRead.WebhookDefinition;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
        anchorIdParts: string[];
        route: string;
    }
}

export const WebhookContent = React.memo<WebhookContent.Props>(function WebhookContent({
    webhook,
    package: package_,
    hideBottomSeparator = false,
    setContainerRef,
    anchorIdParts,
    route,
}) {
    const { setHoveredPayloadPropertyPath } = useWebhookContext();
    const onHoverPayloadProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredPayloadPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredPayloadPropertyPath]
    );

    const computeAnchor = useCallback(
        (
            attributeType: "headers" | "payload" | "response",
            attribute?:
                | FernRegistryApiRead.ObjectProperty
                | FernRegistryApiRead.PathParameter
                | FernRegistryApiRead.QueryParameter
        ) => {
            let anchor = "";
            if (isSubpackage(package_)) {
                anchor += snakeCase(package_.urlSlug) + "_";
            }
            anchor += snakeCase(webhook.id);
            anchor += "-" + attributeType;
            if (attribute?.key != null) {
                anchor += "-" + snakeCase(attribute.key);
            }
            return anchor;
        },
        [package_, webhook]
    );

    const example = webhook.examples[0]; // TODO: Need a way to show all the examples

    const webhookExample = example ? <WebhookExample example={example} /> : null;

    return (
        <ApiPageMargins
            className={classNames("pb-20 pl-6 md:pl-12 pr-4", {
                "border-border-default-light dark:border-border-default-dark border-b": !hideBottomSeparator,
            })}
        >
            <div
                className="flex min-w-0 flex-1 flex-col lg:flex-row lg:space-x-[4vw]"
                ref={setContainerRef}
                data-route={route}
                style={{ scrollMarginTop: HEADER_HEIGHT }}
            >
                <div className="flex min-w-0 max-w-2xl flex-1 flex-col">
                    <div className="py-8">
                        {isSubpackage(package_) && (
                            <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                                {getSubpackageTitle(package_)}
                            </div>
                        )}
                        <div className="typography-font-heading text-text-primary-light dark:text-text-primary-dark text-3xl font-bold">
                            {webhook.name}
                        </div>
                    </div>
                    <ApiPageDescription description={webhook.description} isMarkdown={true} />
                    {webhook.headers.length > 0 && (
                        <div className="mt-8 flex">
                            <div className="flex flex-1 flex-col gap-12">
                                <WebhookSection title="Headers" route={`${route}#${computeAnchor("headers")}`}>
                                    <WebhookHeadersSection
                                        webhook={webhook}
                                        anchorIdParts={anchorIdParts}
                                        route={route}
                                    />
                                </WebhookSection>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex">
                        <div className="flex flex-1 flex-col gap-12">
                            <WebhookSection title="Payload" route={`${route}#${computeAnchor("payload")}`}>
                                <WebhookPayloadSection
                                    payload={webhook.payload}
                                    onHoverProperty={onHoverPayloadProperty}
                                    anchorIdParts={anchorIdParts}
                                    route={route}
                                />
                            </WebhookSection>
                        </div>
                    </div>

                    <div className="mt-8 flex">
                        <div className="flex flex-1 flex-col gap-12">
                            <WebhookSection title="Response" route={`${route}#${computeAnchor("response")}`}>
                                <WebhookResponseSection />
                            </WebhookSection>
                        </div>
                    </div>
                </div>
                <div
                    className={classNames(
                        "flex-1 sticky self-start top-0 min-w-sm max-w-lg ml-auto",
                        // the py-10 is the same as the 40px below
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-[calc(100vh-4rem)]",
                        // hide on mobile,
                        "hidden lg:flex"
                    )}
                    style={{ top: HEADER_HEIGHT }}
                >
                    {webhookExample}
                </div>

                <div className="mt-10 flex max-h-[150vh] lg:mt-0 lg:hidden">{webhookExample}</div>
            </div>
        </ApiPageMargins>
    );
});
