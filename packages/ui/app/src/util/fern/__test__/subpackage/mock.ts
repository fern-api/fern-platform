import { APIV1Read } from "@fern-api/fdr-sdk";

const EP_1: APIV1Read.EndpointDefinition = {
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

const EP_2: APIV1Read.EndpointDefinition = {
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

export const SUBPACKAGE_EMPTY: APIV1Read.ApiDefinitionSubpackage = {
    subpackageId: "sub1",
    endpoints: [],
    name: "",
    subpackages: [],
    types: [],
    urlSlug: "sub_1",
    webhooks: [],
    websockets: [],
};

export const SUBPACKAGE_WITH_2_ENDPOINTS: APIV1Read.ApiDefinitionSubpackage = {
    subpackageId: "sub2",
    endpoints: [EP_1, EP_2],
    name: "",
    subpackages: [],
    types: [],
    urlSlug: "sub_2",
    webhooks: [],
    websockets: [],
};

export const SUBPACKAGE_WITH_NESTED_SUBPACKAGES: APIV1Read.ApiDefinitionSubpackage = {
    subpackageId: "sub3",
    endpoints: [],
    name: "",
    subpackages: [SUBPACKAGE_EMPTY.subpackageId, SUBPACKAGE_WITH_2_ENDPOINTS.subpackageId],
    types: [],
    urlSlug: "sub_3",
    webhooks: [],
    websockets: [],
};

export const DEFINITION: APIV1Read.ApiDefinition = {
    id: "definition" as APIV1Read.ApiDefinition["id"],
    rootPackage: {
        endpoints: [],
        subpackages: [],
        types: [],
        webhooks: [],
        websockets: [],
    },
    subpackages: {
        [SUBPACKAGE_EMPTY.subpackageId]: SUBPACKAGE_EMPTY,
        [SUBPACKAGE_WITH_2_ENDPOINTS.subpackageId]: SUBPACKAGE_WITH_2_ENDPOINTS,
        [SUBPACKAGE_WITH_NESTED_SUBPACKAGES.subpackageId]: SUBPACKAGE_WITH_NESTED_SUBPACKAGES,
    },
    types: {},
};
