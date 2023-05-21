import { kebabCase } from "lodash";
import { FernRegistry } from "../../generated";

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
            endpoints: writeShape.rootPackage.endpoints.map((endpoint) => transformEndpoint({ writeShape: endpoint })),
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
            });
            return subpackages;
        }, {}),
    };
}

function transformSubpackage({
    writeShape,
    id,
    subpackageToParent,
}: {
    writeShape: FernRegistry.api.v1.register.ApiDefinitionSubpackage;
    id: FernRegistry.api.v1.register.SubpackageId;
    subpackageToParent: Record<FernRegistry.api.v1.register.SubpackageId, FernRegistry.api.v1.register.SubpackageId>;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.ApiDefinitionSubpackage> {
    const parent = subpackageToParent[id];
    return {
        subpackageId: id,
        parent: parent,
        name: writeShape.name,
        endpoints: writeShape.endpoints.map((endpoint) => transformEndpoint({ writeShape: endpoint })),
        types: writeShape.types,
        subpackages: writeShape.subpackages,
        urlSlug: kebabCase(writeShape.name),
    };
}

function transformEndpoint({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.EndpointDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.EndpointDefinition> {
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
        examples: writeShape.examples,
        description: writeShape.description,
    };
}

type WithoutQuestionMarks<T> = {
    [K in keyof Required<T>]: undefined extends T[K] ? T[K] | undefined : T[K];
};

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}
