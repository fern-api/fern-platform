import { NavigationNode } from "./NavigationNode";
import { NavigationNodeLeaf } from "./NavigationNodeLeaf";

export type NavigationNodeWithChildren = Exclude<NavigationNode, NavigationNodeLeaf>;
