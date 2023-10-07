import type { DefinitionNode, DefinitionNodeType } from "../types";

export function expectPageNode(node: DefinitionNode | undefined): asserts node is DefinitionNode.Page {
    expectNode(node).toBeOfType("page");
}

export function expectEndpointNode(node: DefinitionNode | undefined): asserts node is DefinitionNode.Endpoint {
    expectNode(node).toBeOfType("endpoint");
}

interface NodeExpectation {
    toBeOfType: (type: DefinitionNodeType) => void;
}

export function expectNode(node: DefinitionNode | undefined): NodeExpectation {
    return {
        toBeOfType: (type) => {
            expect(node?.type).toEqual(type);
        },
    };
}
