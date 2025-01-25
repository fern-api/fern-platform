import { FernNavigation } from "../../..";

export type NavigationNodeParent = Exclude<
  FernNavigation.NavigationNode,
  FernNavigation.NavigationNodeLeaf
>;
