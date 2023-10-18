import type * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";
import type { DocsNode, DocsNodeType } from "../types";

export function expectDocsSectionNode(node: DocsNode | undefined): asserts node is DocsNode.DocsSection {
    expectNode(node).toBeOfType("docs-section");
}

export function expectTopLevelEndpointNode(node: DocsNode | undefined): asserts node is DocsNode.TopLevelEndpoint {
    expectNode(node).toBeOfType("top-level-endpoint");
}

export function expectEndpointNode(node: DocsNode | undefined): asserts node is DocsNode.Endpoint {
    expectNode(node).toBeOfType("endpoint");
}

export function expectPageNode(node: DocsNode | undefined): asserts node is DocsNode.Page {
    expectNode(node).toBeOfType("page");
}

export function expectDocsSection(
    section: FernRegistryDocsRead.DocsSection | null,
): asserts section is FernRegistryDocsRead.DocsSection {
    if (section == null) {
        throw new Error("Expected 'section' to be non-null");
    }
}

interface NodeExpectation {
    toBeOfType: (type: DocsNodeType | undefined) => void;
}

export function expectNode(node: DocsNode | undefined): NodeExpectation {
    return {
        toBeOfType: (type) => {
            expect(node?.type).toEqual(type);
        },
    };
}
