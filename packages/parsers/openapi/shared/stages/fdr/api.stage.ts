import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { ApiNode, ApiNodeContext } from "../../interfaces/api.node.interface";
import { FdrStage } from "../../interfaces/fdr.stage.interface";

type ApiProcessingStageOutput = {
    endpoints: FdrAPI.api.latest.ApiDefinition["endpoints"];
    websockets: FdrAPI.api.latest.ApiDefinition["websockets"];
    webhooks: FdrAPI.api.latest.ApiDefinition["webhooks"];
};

export class FdrApiStage implements FdrStage<OpenAPIV3_1.Document, ApiProcessingStageOutput> {
    stageName = "ApiProcessingStage";
    name = "ApiProcessingStage";
    qualifiedId: string;

    endpoints: ApiProcessingStageOutput["endpoints"] = {};
    websockets: ApiProcessingStageOutput["websockets"] = {};
    webhooks: ApiProcessingStageOutput["webhooks"] = {};

    constructor(
        readonly context: ApiNodeContext,
        readonly preProcessedInput: OpenAPIV3_1.Document["paths"],
        readonly accessPath: ApiNode<unknown, unknown>[],
    ) {
        this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
        this.accessPath.push(this);

        for (const [path, pathItem] of Object.entries(this.preProcessedInput)) {
        }
    }

    outputFdrShape = (): ApiProcessingStageOutput => {
        return {
            endpoints: {},
            webhooks: {},
            websockets: {},
        };
    };
}
