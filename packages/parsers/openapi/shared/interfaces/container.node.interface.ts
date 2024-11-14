import { ApiNode } from "./api.node.interface";

export interface ContainerNode<InputShape, InnerNodeInputShape, FdrShape> extends ApiNode<InputShape, FdrShape> {
    innerNodeInputShape: InnerNodeInputShape;
}
