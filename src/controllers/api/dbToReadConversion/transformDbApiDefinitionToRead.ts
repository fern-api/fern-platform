import { FernRegistry } from "../../../generated";
import { type WithoutQuestionMarks } from "../../../util";

export function transformApiDefinitionForReading(
    dbShape: FernRegistry.api.v1.db.DbApiDefinition
): WithoutQuestionMarks<FernRegistry.api.v1.read.ApiDefinition> {
    return {
        id: dbShape.id,
        rootPackage: {
            endpoints: dbShape.rootPackage.endpoints.map((endpoint) => transformEndpoint({ dbShape: endpoint })),
            subpackages: dbShape.rootPackage.subpackages,
            types: dbShape.rootPackage.types,
        },
        types: dbShape.types,
        subpackages: Object.fromEntries(
            Object.entries(dbShape.subpackages).map(([id, subpackage]) => {
                return [id, transformSubpackage({ dbShape: subpackage })];
            })
        ),
        auth: dbShape.auth,
    };
}

function transformSubpackage({
    dbShape,
}: {
    dbShape: FernRegistry.api.v1.db.DbApiDefinitionSubpackage;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.ApiDefinitionSubpackage> {
    return {
        subpackageId: dbShape.subpackageId,
        parent: dbShape.parent,
        name: dbShape.name,
        endpoints: dbShape.endpoints.map((endpoint) => transformEndpoint({ dbShape: endpoint })),
        types: dbShape.types,
        subpackages: dbShape.subpackages,
        pointsTo: dbShape.pointsTo,
        urlSlug: dbShape.urlSlug,
        description: dbShape.description,
        htmlDescription: dbShape.htmlDescription,
    };
}

function transformEndpoint({
    dbShape,
}: {
    dbShape: FernRegistry.api.v1.db.DbEndpointDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.EndpointDefinition> {
    return {
        environments: dbShape.environments ?? [],
        defaultEnvironment: dbShape.defaultEnvironment,
        urlSlug: dbShape.urlSlug,
        method: dbShape.method,
        id: dbShape.id,
        name: dbShape.name,
        path: dbShape.path,
        queryParameters: dbShape.queryParameters,
        headers: dbShape.headers,
        request: dbShape.request,
        response: dbShape.response,
        examples: dbShape.examples,
        description: dbShape.description,
        htmlDescription: dbShape.htmlDescription,
        authed: dbShape.authed ?? false,
    };
}
