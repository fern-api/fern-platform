import {
  ApiDefinitionId,
  ApiReferenceNode,
  EndpointId,
  EndpointNode,
  NodeId,
  RootNode,
  Slug,
  UnversionedNode,
  VersionNode,
  VersionedNode,
} from "@fern-api/fdr-sdk/navigation";

import { flattenApiSection } from "./flatten-apis";

function createEndpointNode(id: string, title: string): EndpointNode {
  return {
    id: NodeId(id),
    type: "endpoint",
    title,
    slug: Slug(title.toLowerCase().replace(/\s+/g, "-")),
    apiDefinitionId: ApiDefinitionId("1"),
    availability: undefined,
    canonicalSlug: Slug(title.toLowerCase().replace(/\s+/g, "-")),
    icon: undefined,
    hidden: undefined,
    authed: undefined,
    method: "POST",
    orphaned: undefined,
    viewers: undefined,
    featureFlags: undefined,
    endpointId: EndpointId(id),
    isResponseStream: false,
    playground: undefined,
  };
}

function createApiReferenceNode(children: any): ApiReferenceNode {
  return {
    type: "apiReference",
    id: NodeId("api-ref"),
    title: "API Reference",
    slug: Slug("api-reference"),
    apiDefinitionId: ApiDefinitionId("1"),
    availability: undefined,
    canonicalSlug: undefined,
    icon: undefined,
    hidden: undefined,
    authed: undefined,
    orphaned: undefined,
    viewers: undefined,
    featureFlags: undefined,
    paginated: undefined,
    showErrors: undefined,
    hideTitle: undefined,
    children,
    changelog: undefined,
    playground: undefined,
    noindex: undefined,
    overviewPageId: undefined,
    pointsTo: undefined,
  };
}

function createVersionNode(versionId: string, children: any): VersionNode {
  return {
    id: NodeId(versionId),
    type: "version",
    title: versionId,
    slug: Slug(versionId),
    versionId: versionId as any, // Type assertion needed due to SDK type mismatch
    default: true,
    availability: undefined,
    landingPage: undefined,
    canonicalSlug: undefined,
    icon: undefined,
    hidden: undefined,
    authed: undefined,
    orphaned: undefined,
    viewers: undefined,
    featureFlags: undefined,
    pointsTo: undefined,
    child: {
      type: "sidebarRoot",
      id: NodeId("2"),
      children: [createApiReferenceNode(children)],
    },
  };
}

function createRootNode(children: any, versioned: boolean): RootNode {
  let sidebar;
  if (versioned) {
    sidebar = {
      id: NodeId("1"),
      landingPage: undefined,
      type: "versioned",
      children: [createVersionNode("v1", children)],
    } as VersionedNode;
  } else {
    sidebar = {
      id: NodeId("1"),
      landingPage: undefined,
      type: "unversioned",
      child: {
        type: "sidebarRoot",
        id: NodeId("2"),
        children: [createApiReferenceNode(children)],
      },
    } as UnversionedNode;
  }

  return {
    type: "root",
    child: sidebar,
    version: "v2",
    title: "Root",
    slug: Slug("root"),
    canonicalSlug: undefined,
    authed: undefined,
    icon: undefined,
    hidden: false,
    id: NodeId("4"),
    viewers: undefined,
    orphaned: undefined,
    pointsTo: undefined,
    roles: [],
    featureFlags: [],
  };
}

describe("flattenApi", () => {
  it("empty root returns empty array", () => {
    expect(flattenApiSection(undefined)).toEqual([]);
  });

  it("unversioned api reference with single endpoint flattens", () => {
    const endpoints = [createEndpointNode("1", "Endpoint One")];
    const root = createRootNode(endpoints, false);
    const result = flattenApiSection(root);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      api: ApiDefinitionId("1"),
      id: NodeId("api-ref"),
      breadcrumb: ["API Reference"],
      items: endpoints,
    });
  });

  it("unversioned api reference with multiple endpoints flattens", () => {
    const endpoints = [
      createEndpointNode("1", "Endpoint One"),
      createEndpointNode("2", "Endpoint Two"),
      createEndpointNode("3", "Endpoint Three"),
    ];
    const root = createRootNode(endpoints, false);
    const result = flattenApiSection(root);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      api: ApiDefinitionId("1"),
      id: NodeId("api-ref"),
      breadcrumb: ["API Reference"],
      items: endpoints,
    });
  });

  it("versioned api reference with single endpoint flattens", () => {
    const endpoints = [createEndpointNode("1", "Endpoint One")];
    const root = createRootNode(endpoints, true);
    const result = flattenApiSection(root);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      api: ApiDefinitionId("1"),
      id: NodeId("api-ref"),
      breadcrumb: ["API Reference"],
      items: endpoints,
    });
  });

  it("versioned api reference with multiple endpoints flattens", () => {
    const endpoints = [
      createEndpointNode("1", "Endpoint One"),
      createEndpointNode("2", "Endpoint Two"),
      createEndpointNode("3", "Endpoint Three"),
    ];
    const root = createRootNode(endpoints, true);
    const result = flattenApiSection(root);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      api: ApiDefinitionId("1"),
      id: NodeId("api-ref"),
      breadcrumb: ["API Reference"],
      items: endpoints,
    });
  });

  it("versioned api reference with single section flattens", () => {
    const sections = [
      {
        type: "apiPackage",
        id: NodeId("section-1"),
        title: "Section One",
        slug: Slug("section-one"),
        apiDefinitionId: ApiDefinitionId("1"),
        children: [
          createEndpointNode("1", "Endpoint One"),
          createEndpointNode("2", "Endpoint Two"),
        ],
      },
    ];

    const root = createRootNode(sections, true);
    const result = flattenApiSection(root);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      api: ApiDefinitionId("1"),
      id: NodeId("section-1"),
      breadcrumb: ["Section One"],
      items: sections[0]?.children,
    });
  });

  it("versioned api reference with multiple sections flattens", () => {
    const sections = [
      {
        type: "apiPackage",
        id: NodeId("section-1"),
        title: "Section One",
        slug: Slug("section-one"),
        apiDefinitionId: ApiDefinitionId("1"),
        children: [
          createEndpointNode("1", "Endpoint One"),
          createEndpointNode("2", "Endpoint Two"),
        ],
      },
      {
        type: "apiPackage",
        id: NodeId("section-2"),
        title: "Section Two",
        slug: Slug("section-two"),
        apiDefinitionId: ApiDefinitionId("1"),
        children: [
          createEndpointNode("3", "Endpoint Three"),
          createEndpointNode("4", "Endpoint Four"),
        ],
      },
    ];

    const root = createRootNode(sections, true);
    const result = flattenApiSection(root);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      api: ApiDefinitionId("1"),
      id: NodeId("section-1"),
      breadcrumb: ["Section One"],
      items: sections[0]?.children,
    });
    expect(result[1]).toEqual({
      api: ApiDefinitionId("1"),
      id: NodeId("section-2"),
      breadcrumb: ["Section Two"],
      items: sections[1]?.children,
    });
  });
});
