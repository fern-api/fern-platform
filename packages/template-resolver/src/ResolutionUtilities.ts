import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";

export class ObjectFlattener {
    private flattenedObjects: Map<
        FernRegistry.TypeId,
        FernRegistry.api.v1.read.ObjectProperty[]
    > = new Map<
        FernRegistry.TypeId,
        FernRegistry.api.v1.read.ObjectProperty[]
    >();

    constructor(
        private readonly apiDefinition: FernRegistry.api.v1.read.ApiDefinition
    ) {}

    public getFlattenedObjectPropertiesFromObjectType(
        objectType: FernRegistry.api.v1.read.ObjectType
    ): FernRegistry.api.v1.read.ObjectProperty[] {
        const flattenedProperties: FernRegistry.api.v1.read.ObjectProperty[] =
            [];
        flattenedProperties.push(...objectType.properties);
        objectType.extends.forEach((ext) => {
            flattenedProperties.push(...this.getFlattenedObjectProperties(ext));
        });

        return flattenedProperties;
    }

    public getFlattenedObjectProperties(
        typeId: FernRegistry.TypeId
    ): FernRegistry.api.v1.read.ObjectProperty[] {
        if (this.flattenedObjects.has(typeId)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.flattenedObjects.get(typeId)!;
        }

        const maybeType = this.apiDefinition.types[typeId];
        if (maybeType == null) {
            return [];
        }

        const flattenedProperties: FernRegistry.api.v1.read.ObjectProperty[] =
            [];
        switch (maybeType.shape.type) {
            case "object":
                flattenedProperties.push(...maybeType.shape.properties);
                maybeType.shape.extends.forEach((ext) => {
                    flattenedProperties.push(
                        ...this.getFlattenedObjectProperties(ext)
                    );
                });
                break;
            default:
                // This mirrors how we expand the properties in Python, we assume the extended type is an object
                return [];
        }

        this.flattenedObjects.set(typeId, flattenedProperties);
        return flattenedProperties;
    }
}
