import { OpenAPIV3_1 } from "openapi-types";

import { isNonNullish } from "@fern-api/ui-core-utils";
import { FernRegistry } from "../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveWebhookReference } from "../../utils/3.1/resolveWebhookReference";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { PathItemObjectConverterNode } from "./PathItemObjectConverter.node";

export class WebhooksObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.Document["webhooks"],
    FernRegistry.api.latest.ApiDefinition["webhooks"]
> {
    webhooks: Record<string, PathItemObjectConverterNode> | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
            OpenAPIV3_1.Document["webhooks"]
        >,
        protected readonly basePath: XFernBasePathConverterNode | undefined
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.webhooks = Object.fromEntries(
            Object.entries(this.input ?? {})
                .map(([operation, operationItem]) => {
                    const resolvedOperationItem = resolveWebhookReference(
                        operationItem,
                        this.context.document
                    );
                    if (resolvedOperationItem == null) {
                        return undefined;
                    }
                    return [
                        operation,
                        new PathItemObjectConverterNode(
                            {
                                input: resolvedOperationItem,
                                context: this.context,
                                accessPath: this.accessPath,
                                pathId: operation,
                            },
                            undefined,
                            this.basePath,
                            true
                        ),
                    ];
                })
                .filter(isNonNullish)
        );
    }

    convert(): FernRegistry.api.latest.ApiDefinition["webhooks"] | undefined {
        return {};
    }
}
