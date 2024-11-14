import { ApiNode, ApiNodeContext, ComposableApiNode } from "../interfaces/api.node.interface";

export class AvailabilityNode<T, InputNode extends ApiNode<unknown, T> & { availability: string }>
    implements
        ComposableApiNode<
            T,
            InputNode,
            T & {
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

    outputFdrShape(): T & {
        availability: string;
    } {
        const baseShape = this.inputNode.outputFdrShape();
        return {
            ...baseShape,
            availability: this.inputNode.availability,
        };
    }
}
