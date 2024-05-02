import { APIV1Db, APIV1Read, DiffService, FdrAPI } from "../../api";
import { PathParameter, PathParameterDiff, QueryParameter, QueryParameterDiff } from "../../api/generated/api";
import { type FdrApplication } from "../../app";

export function getApiDiffService(app: FdrApplication): DiffService {
    return new DiffService({
        diff: async (req, res) => {
            const previous = await app.dao.apis().loadAPIDefinition(req.query.previousApiDefinitionId);
            const current = await app.dao.apis().loadAPIDefinition(req.query.currentApiDefinitionId);

            if (!previous || !current) {
                throw new APIV1Read.ApiDoesNotExistError();
            }

            const previousEndpoints = getEndpoints(previous);
            const currentEndpoints = getEndpoints(current);

            const visitedEndpoints: Set<string> = new Set();
            const addedEndpoints: FdrAPI.AddedEndpoint[] = [];
            const updatedEndpoints: FdrAPI.UpdatedEndpoint[] = [];
            for (const [endpointId, currentEndpoint] of Object.entries(currentEndpoints)) {
                const previousEndpoint = previousEndpoints[endpointId];
                const endpointIdentifier = {
                    method: currentEndpoint.method,
                    path: getEndpointPath(currentEndpoint),
                };
                if (previousEndpoint == null) {
                    addedEndpoints.push({
                        id: endpointIdentifier,
                    });
                    continue;
                } else {
                    const endpointDiff: FdrAPI.UpdatedEndpoint = {
                        id: endpointIdentifier,
                        pathParameterDiff: getPathParameterDiff({
                            previous: previousEndpoint,
                            current: currentEndpoint,
                        }),
                        queryParameterDiff: getQueryParameterDiff({
                            previous: previousEndpoint,
                            current: currentEndpoint,
                        }),
                        requestBodyDiff: {
                            added: [],
                            removed: [],
                        },
                        responseBodyDiff: {
                            added: [],
                            removed: [],
                        },
                    };
                    updatedEndpoints.push(endpointDiff);
                }
                visitedEndpoints.add(endpointId);
            }
            return res.send({
                addedEndpoints,
                updatedEndpoints,
                removedEndpoints: [],
            });
        },
    });
}

function getPathParameterDiff({
    previous,
    current,
}: {
    previous: APIV1Db.DbEndpointDefinition;
    current: APIV1Db.DbEndpointDefinition;
}): PathParameterDiff {
    const added: PathParameter[] = [];
    const removed: PathParameter[] = [];
    for (const currentParameter of current.path.pathParameters) {
        const previousParameter = previous.path.pathParameters.find((maybePreviousParameter) => {
            maybePreviousParameter.key === currentParameter.key;
        });
        if (previousParameter == null) {
            added.push({
                wireKey: currentParameter.key,
            });
        }
    }
    return {
        added,
        removed,
    };
}

function getQueryParameterDiff({
    previous,
    current,
}: {
    previous: APIV1Db.DbEndpointDefinition;
    current: APIV1Db.DbEndpointDefinition;
}): QueryParameterDiff {
    const added: QueryParameter[] = [];
    const removed: QueryParameter[] = [];
    for (const currentParameter of current.path.pathParameters) {
        const previousParameter = previous.path.pathParameters.find((maybePreviousParameter) => {
            maybePreviousParameter.key === currentParameter.key;
        });
        if (previousParameter == null) {
            added.push({
                wireKey: currentParameter.key,
            });
        }
    }
    return {
        added,
        removed,
    };
}

function getEndpoints(apiDefinition: APIV1Db.DbApiDefinition): Record<string, APIV1Db.DbEndpointDefinition> {
    const endpoints: Record<string, APIV1Db.DbEndpointDefinition> = {};
    apiDefinition.rootPackage.endpoints.forEach((endpoint) => {
        endpoints[getEndpointId(endpoint)] = endpoint;
    });
    Object.values(apiDefinition.subpackages).forEach((subpackage) => {
        subpackage.endpoints.forEach((endpoint) => {
            endpoints[getEndpointId(endpoint)] = endpoint;
        });
    });
    return endpoints;
}

function getEndpointId(endpoint: APIV1Db.DbEndpointDefinition): string {
    const path = getEndpointPath(endpoint);
    return `${endpoint.method}_${path}`;
}

function getEndpointPath(endpoint: APIV1Db.DbEndpointDefinition): string {
    let path = "";
    for (const part of endpoint.path.parts) {
        if (part.type === "literal") {
            path += part.value;
        } else {
            path += `{${part.value}}`;
        }
    }
    return path;
}
