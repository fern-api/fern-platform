import { NavigationNode } from "./NavigationNode";
import { NavigationNodeLeaf } from "./NavigationNodeLeaf";

export type NavigationNodeParent = Exclude<NavigationNode, NavigationNodeLeaf>;
