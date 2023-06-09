import { kebabCase } from "lodash";
import { WithoutQuestionMarks } from "../../../WithoutQuestionMarks";
import { FernRegistry } from "../../../generated";
import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";
import { generateDummyEndpointExampleCall } from "./generateDummyEndpointExampleCall";

export function transformApiDefinitionForDb(
    writeShape: FernRegistry.api.v1.register.ApiDefinition,
    id: FernRegistry.ApiDefinitionId
): WithoutQuestionMarks<FernRegistry.api.v1.db.DbApiDefinition> {
    const subpackageToParent: Record<
        FernRegistry.api.v1.register.SubpackageId,
        FernRegistry.api.v1.register.SubpackageId
    > = {};
    for (const [parentId, parentContents] of entries(writeShape.subpackages)) {
        for (const subpackageId of parentContents.subpackages) {
            subpackageToParent[subpackageId] = parentId;
        }
    }

    return {
        id,
        rootPackage: {
            endpoints: writeShape.rootPackage.endpoints.map((endpoint) =>
                transformEndpoint({ writeShape: endpoint, apiDefinition: writeShape })
            ),
            subpackages: writeShape.rootPackage.subpackages,
            types: writeShape.rootPackage.types,
        },
        types: writeShape.types,
        subpackages: entries(writeShape.subpackages).reduce<
            Record<FernRegistry.api.v1.read.SubpackageId, FernRegistry.api.v1.db.DbApiDefinitionSubpackage>
        >((subpackages, [subpackageId, subpackage]) => {
            subpackages[subpackageId] = transformSubpackage({
                writeShape: subpackage,
                id: subpackageId,
                subpackageToParent,
                apiDefinition: writeShape,
            });
            return subpackages;
        }, {}),
        auth: writeShape.auth,
    };
}

function transformSubpackage({
    writeShape,
    id,
    subpackageToParent,
    apiDefinition,
}: {
    writeShape: FernRegistry.api.v1.register.ApiDefinitionSubpackage;
    id: FernRegistry.api.v1.register.SubpackageId;
    subpackageToParent: Record<FernRegistry.api.v1.register.SubpackageId, FernRegistry.api.v1.register.SubpackageId>;
    apiDefinition: FernRegistry.api.v1.register.ApiDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.db.DbApiDefinitionSubpackage> {
    const parent = subpackageToParent[id];
    const endpoints = writeShape.endpoints.map((endpoint) =>
        transformEndpoint({ writeShape: endpoint, apiDefinition })
    );
    return {
        subpackageId: id,
        parent: parent,
        name: writeShape.name,
        endpoints: endpoints,
        types: writeShape.types,
        subpackages: writeShape.subpackages,
        pointsTo: writeShape.pointsTo,
        urlSlug: kebabCase(writeShape.name),
        description: writeShape.description,
    };
}

function transformEndpoint({
    writeShape,
    apiDefinition,
}: {
    writeShape: FernRegistry.api.v1.register.EndpointDefinition;
    apiDefinition: FernRegistry.api.v1.register.ApiDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.db.DbEndpointDefinition> {
    let examples: ApiV1Write.ExampleEndpointCall[] = [];
    if (writeShape.examples.length > 0) {
        examples = [...writeShape.examples];
    } else {
        try {
            examples = [generateDummyEndpointExampleCall(writeShape, apiDefinition)];
        } catch (err) {
            console.error("Failed to generate example", err);
        }
    }
    return {
        environments: writeShape.environments,
        defaultEnvironment: writeShape.defaultEnvironment,
        urlSlug: kebabCase(writeShape.name),
        method: writeShape.method,
        id: writeShape.id,
        name: writeShape.name,
        path: writeShape.path,
        queryParameters: writeShape.queryParameters,
        headers: writeShape.headers,
        request: writeShape.request,
        response: writeShape.response,
        examples: examples.map((example) =>
            transformExampleEndpointCall({
                writeShape: example,
                endpointDefinition: writeShape,
            })
        ),
        description: writeShape.description,
        authed: writeShape.auth,
    };
}

// exported for testing
export function transformExampleEndpointCall({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.ExampleEndpointCall;
    endpointDefinition: FernRegistry.api.v1.register.EndpointDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.ExampleEndpointCall> {
    return {
        description: writeShape.description,
        path: writeShape.path,
        pathParameters: writeShape.pathParameters,
        queryParameters: writeShape.queryParameters,
        headers: writeShape.headers,
        requestBody: writeShape.requestBody,
        responseStatusCode: writeShape.responseStatusCode,
        responseBody: writeShape.responseBody,
        codeExamples: {
            nodeAxios: "",
        },
        requestBodyV2: undefined,
        responseBodyV2: undefined,
    };
}

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}
