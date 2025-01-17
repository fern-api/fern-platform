import type { RootNode } from "../client/generated/api/resources/navigation/resources/v1/types";
import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { ApiDefinitionPruner } from "./ApiDefinitionPruner";
import { ApiTypeIdVisitor } from "./ApiTypeIdVisitor";
import { NodeCollector } from "./NodeCollector";

export * from "../client/generated/api/resources/commons";
export * from "./ApiDefinitionHolder";
export * as migrate from "./migrators";
export * as utils from "./utils";
export * from "./utils/pruneNavigationTree";
export * from "./versions";
export {
  ApiDefinitionHolder,
  ApiDefinitionPruner,
  ApiTypeIdVisitor,
  NodeCollector,
};

/**
 * Type guard to check if a node is a ProductGroupNode
 */
export function isProductGroup(node: RootNode): boolean {
  return node.type === "productgroup";
}
