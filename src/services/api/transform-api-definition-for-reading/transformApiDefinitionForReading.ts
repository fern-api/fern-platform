import HTTPSnippet from "httpsnippet";
import { kebabCase } from "lodash";
import { WithoutQuestionMarks } from "../../../WithoutQuestionMarks";
import { FernRegistry } from "../../../generated";
import { generateDummyEndpointExampleCall } from "./generateDummyEndpointExampleCall";

export function transformApiDefinitionForReading(
    writeShape: FernRegistry.api.v1.register.ApiDefinition,
    id: FernRegistry.ApiDefinitionId
): WithoutQuestionMarks<FernRegistry.api.v1.read.ApiDefinition> {
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
            Record<FernRegistry.api.v1.read.SubpackageId, FernRegistry.api.v1.read.ApiDefinitionSubpackage>
        >((subpackages, [subpackageId, subpackage]) => {
            subpackages[subpackageId] = transformSubpackage({
                writeShape: subpackage,
                id: subpackageId,
                subpackageToParent,
                apiDefinition: writeShape,
            });
            return subpackages;
        }, {}),
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
}): WithoutQuestionMarks<FernRegistry.api.v1.read.ApiDefinitionSubpackage> {
    const parent = subpackageToParent[id];
    return {
        subpackageId: id,
        parent: parent,
        name: writeShape.name,
        endpoints: writeShape.endpoints.map((endpoint) => transformEndpoint({ writeShape: endpoint, apiDefinition })),
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
}): WithoutQuestionMarks<FernRegistry.api.v1.read.EndpointDefinition> {
    const examples =
        writeShape.examples.length > 0
            ? writeShape.examples
            : [generateDummyEndpointExampleCall(writeShape, apiDefinition)];

    return {
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
    };
}

// exported for testing
export function transformExampleEndpointCall({
    writeShape,
    endpointDefinition,
}: {
    writeShape: FernRegistry.api.v1.register.ExampleEndpointCall;
    endpointDefinition: FernRegistry.api.v1.register.EndpointDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.ExampleEndpointCall> {
    const httpSnippet = createHttpSnippet(endpointDefinition, writeShape);

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
            nodeAxios: convertHttpSnippet(httpSnippet, "node", "axios"),
        },
        requestBodyV2: undefined,
        responseBodyV2: undefined,
    };
}

function createHttpSnippet(
    endpointDefinition: FernRegistry.api.v1.register.EndpointDefinition,
    writeShape: FernRegistry.api.v1.register.ExampleEndpointCall
) {
    return new HTTPSnippet({
        method: endpointDefinition.method,
        url: `http://localhost:8080${writeShape.path}`,
        postData: {
            mimeType: "application/json",
            text: writeShape.requestBody != null ? JSON.stringify(writeShape.requestBody) : "",
        },
        headers: Object.entries(writeShape.headers).map(([name, value]) => ({
            name,
            value: `${value}`,
        })),
        cookies: [],
        httpVersion: "2.1",
        queryString: Object.entries(writeShape.queryParameters).map(([name, value]) => ({
            name,
            value: `${value}`,
        })),
        headersSize: -1,
        bodySize: -1,
    });
}

function convertHttpSnippet(
    httpSnippet: HTTPSnippet,
    target: string,
    client?: string,
    options?: HTTPSnippet.Options
): string {
    const example = httpSnippet.convert(target, client, options);
    if (example === false) {
        throw new Error(`Failed to create ${target} example`);
    }
    return example;
}

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}
