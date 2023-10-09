import type { DocsNode, FullSlug } from "./types";

export class PathCollisionError extends Error {
    constructor(public readonly slug: FullSlug, public readonly collidingNodes: DocsNode[]) {
        super(
            `Slug cannot be resolved due to ${collidingNodes.length} collisions.\n` +
                `Colliding node types: ${collidingNodes.map((n) => n.type).join(", ")}`
        );
    }
}
