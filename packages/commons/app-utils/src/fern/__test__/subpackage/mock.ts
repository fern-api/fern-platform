import * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";

const EP_1: FernRegistryApiRead.EndpointDefinition = {
    id: "ep1",
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

const EP_2: FernRegistryApiRead.EndpointDefinition = {
    id: "ep2",
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

export const SUBPACKAGE_EMPTY: FernRegistryApiRead.ApiDefinitionSubpackage = {
    subpackageId: "sub1",
    endpoints: [],
    name: "",
    subpackages: [],
    types: [],
    urlSlug: "sub_1",
    webhooks: [],
};

export const SUBPACKAGE_WITH_2_ENDPOINTS: FernRegistryApiRead.ApiDefinitionSubpackage = {
    subpackageId: "sub2",
    endpoints: [EP_1, EP_2],
    name: "",
    subpackages: [],
    types: [],
    urlSlug: "sub_2",
    webhooks: [],
};

export const SUBPACKAGE_WITH_NESTED_SUBPACKAGES: FernRegistryApiRead.ApiDefinitionSubpackage = {
    subpackageId: "sub3",
    endpoints: [],
    name: "",
    subpackages: [SUBPACKAGE_EMPTY.subpackageId, SUBPACKAGE_WITH_2_ENDPOINTS.subpackageId],
    types: [],
    urlSlug: "sub_3",
    webhooks: [],
};

export const DEFINITION: FernRegistryApiRead.ApiDefinition = {
    id: "definition" as FernRegistryApiRead.ApiDefinition["id"],
    rootPackage: {
        endpoints: [],
        subpackages: [],
        types: [],
        webhooks: [],
    },
    subpackages: {
        [SUBPACKAGE_EMPTY.subpackageId]: SUBPACKAGE_EMPTY,
        [SUBPACKAGE_WITH_2_ENDPOINTS.subpackageId]: SUBPACKAGE_WITH_2_ENDPOINTS,
        [SUBPACKAGE_WITH_NESTED_SUBPACKAGES.subpackageId]: SUBPACKAGE_WITH_NESTED_SUBPACKAGES,
    },
    types: {},
};
