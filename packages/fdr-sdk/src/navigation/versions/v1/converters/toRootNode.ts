import { FernNavigation } from "../../../..";
import { type DocsV2Read } from "../../../../client/types";

export function toRootNode(
  response: DocsV2Read.LoadDocsForUrlResponse
): FernNavigation.V1.RootNode {
  if (response.definition.config.root) {
    return response.definition.config.root;
  } else {
    console.error("No root node found");
    return {
      type: "root",
      version: "v1",
      child: {
        type: "unversioned",
        id: FernNavigation.V1.NodeId("root-unversioned"),
        child: {
          type: "sidebarRoot",
          id: FernNavigation.V1.NodeId("root-sidebar"),
          children: [],
        },
        landingPage: undefined,
      },
      title: response.definition.config.title ?? "",
      slug: FernNavigation.V1.Slug(""),
      icon: undefined,
      hidden: undefined,
      authed: undefined,
      viewers: undefined,
      orphaned: undefined,
      featureFlags: undefined,
      id: FernNavigation.V1.NodeId("root"),
      pointsTo: undefined,
      roles: undefined,
    };
  }
}
