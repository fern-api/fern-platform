import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";

const ep1: FernRegistryApiRead.EndpointDefinition = {
    id: FernRegistryApiRead.EndpointId("ep1"),
    authed: false,
    environments: [],
    errors: [],
    examples: [],
    headers: [],
    method: "GET",
    path: { parts: [], pathParameters: [] },
    queryParameters: [],
    urlSlug: "ep_1",
    availability: "Beta",
};

const ep2: FernRegistryApiRead.EndpointDefinition = {
    id: FernRegistryApiRead.EndpointId("ep2"),
    authed: false,
    environments: [],
    errors: [],
    examples: [],
    headers: [],
    method: "GET",
    path: { parts: [], pathParameters: [] },
    queryParameters: [],
    urlSlug: "ep_2",
    availability: "Beta",
};

export const subpackageEmpty: FernRegistryApiRead.ApiDefinitionSubpackage = {
    subpackageId: FernRegistryApiRead.SubpackageId("subpackageEmpty"),
    endpoints: [],
    name: "",
    subpackages: [],
    types: [],
    urlSlug: "sub_1",
    webhooks: [],
};

export const subpackageWith2Endpoints: FernRegistryApiRead.ApiDefinitionSubpackage = {
    subpackageId: FernRegistryApiRead.SubpackageId("subpackageWith2Endpoints"),
    endpoints: [ep1, ep2],
    name: "",
    subpackages: [],
    types: [],
    urlSlug: "sub_2",
    webhooks: [],
};

export const subpackageWithNestedSubpackages: FernRegistryApiRead.ApiDefinitionSubpackage = {
    subpackageId: FernRegistryApiRead.SubpackageId("sub3"),
    endpoints: [],
    name: "",
    subpackages: [subpackageEmpty.subpackageId, subpackageWith2Endpoints.subpackageId],
    types: [],
    urlSlug: "sub_3",
    webhooks: [],
};

export const definition: FernRegistryApiRead.ApiDefinition = {
    id: "definition" as FernRegistryApiRead.ApiDefinition["id"],
    rootPackage: {
        endpoints: [],
        subpackages: [],
        types: [],
        webhooks: [],
    },
    subpackages: {
        [subpackageEmpty.subpackageId]: subpackageEmpty,
        [subpackageWith2Endpoints.subpackageId]: subpackageWith2Endpoints,
        [subpackageWithNestedSubpackages.subpackageId]: subpackageWithNestedSubpackages,
    },
    types: {},
};
