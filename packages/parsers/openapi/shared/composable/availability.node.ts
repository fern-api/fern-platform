import { ApiNode, ApiNodeContext, ComposableApiNode } from "../interfaces/api.node.interface";

export class AvailabilityNode<InputNode extends ApiNode<unknown, object> & { availability: string }>
    implements
        ComposableApiNode<
            InputNode,
            ReturnType<InputNode["outputFdrShape"]> & {
                availability: string;
            }
        >
{
    name = "availability";
    preProcessedInput: InputNode["preProcessedInput"];
    qualifiedId: string;

    constructor(
        readonly context: ApiNodeContext,
        readonly inputNode: InputNode,
        readonly accessPath: ApiNode<unknown, unknown>[],
    ) {
        this.qualifiedId = `${this.accessPath.map((node) => node.qualifiedId).join(".")}.${this.name}`;
        this.preProcessedInput = this.inputNode.preProcessedInput;
    }

    outputFdrShape(): ReturnType<InputNode["outputFdrShape"]> & {
        availability: string;
    } {
        return {
            ...this.inputNode.outputFdrShape(),
            availability: this.inputNode.availability,
        };
    }
}
