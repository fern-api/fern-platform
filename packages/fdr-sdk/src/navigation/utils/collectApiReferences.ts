import { FernNavigation } from "../generated";
import { NavigationNode } from "../types/NavigationNode";
import { traverseNavigation } from "../visitors/traverseNavigation";

export function collectApiReferences(nav: NavigationNode): FernNavigation.ApiReferenceNode[] {
    const apiReferences: FernNavigation.ApiReferenceNode[] = [];
    traverseNavigation(nav, (node) => {
        if (node.type === "apiReference") {
            apiReferences.push(node);
            return "skip";
        }
        return true;
    });
    return apiReferences;
}
