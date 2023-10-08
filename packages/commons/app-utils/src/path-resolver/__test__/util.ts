import type { DefinitionNode, DefinitionNodeType } from "../types";

export function expectDocsSectionNode(node: DefinitionNode | undefined): asserts node is DefinitionNode.DocsSection {
    expectNode(node).toBeOfType("docs-section");
}

export function expectEndpointNode(node: DefinitionNode | undefined): asserts node is DefinitionNode.Endpoint {
    expectNode(node).toBeOfType("endpoint");
}

export function expectPageNode(node: DefinitionNode | undefined): asserts node is DefinitionNode.Page {
    expectNode(node).toBeOfType("page");
}

interface NodeExpectation {
    toBeOfType: (type: DefinitionNodeType | undefined) => void;
}

export function expectNode(node: DefinitionNode | undefined): NodeExpectation {
    return {
        toBeOfType: (type) => {
            expect(node?.type).toEqual(type);
        },
    };
}
