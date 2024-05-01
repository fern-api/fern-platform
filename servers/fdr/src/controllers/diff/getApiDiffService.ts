import { APIV1Db, APIV1Read, DiffService, FdrAPI } from "../../api";
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
            const endpointDiffs: FdrAPI.EndpointDiff[] = [];
            for (const [endpointId, currentEndpoint] of Object.entries(currentEndpoints)) {
                const previousEndpoint = previousEndpoints[endpointId];
                if (previousEndpoint == null) {
                    // TODO: Handle new endpoint
                    continue;
                } else {
                    const endpointDiff: FdrAPI.EndpointDiff = {
                        id: {
                            method: currentEndpoint.method,
                            path: getEndpointPath(currentEndpoint),
                        },
                        pathParameterDiff: {
                            added: [],
                            removed: [],
                        },
                        queryParameterDiff: {
                            added: [],
                            removed: [],
                        },
                        requestBodyDiff: {
                            added: [],
                            removed: [],
                        },
                        responseBodyDiff: {
                            added: [],
                            removed: [],
                        },
                    };
                    endpointDiffs.push(endpointDiff);
                }
                visitedEndpoints.add(endpointId);
            }
            return res.send({
                endpointDiffs,
            });
        },
    });
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
