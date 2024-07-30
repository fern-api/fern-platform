import { APIV1Read } from "@fern-api/fdr-sdk";

export class ObjectFlattener {
    private flattenedObjects: Map<APIV1Read.TypeId, APIV1Read.ObjectProperty[]> = new Map<
        APIV1Read.TypeId,
        APIV1Read.ObjectProperty[]
    >();

    constructor(private readonly apiDefinition: APIV1Read.ApiDefinition) {}

    public getFlattenedObjectPropertiesFromObjectType(objectType: APIV1Read.ObjectType): APIV1Read.ObjectProperty[] {
        const flattenedProperties: APIV1Read.ObjectProperty[] = [];
        flattenedProperties.push(...objectType.properties);
        objectType.extends.forEach((ext) => {
            flattenedProperties.push(...this.getFlattenedObjectProperties(ext));
        });

        return flattenedProperties;
    }

    public getFlattenedObjectProperties(typeId: APIV1Read.TypeId): APIV1Read.ObjectProperty[] {
        if (this.flattenedObjects.has(typeId)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.flattenedObjects.get(typeId)!;
        }

        const maybeType = this.apiDefinition.types[typeId];
        if (maybeType == null) {
            return [];
        }

        const flattenedProperties: APIV1Read.ObjectProperty[] = [];
        switch (maybeType.shape.type) {
            case "object":
                flattenedProperties.push(...maybeType.shape.properties);
                maybeType.shape.extends.forEach((ext) => {
                    flattenedProperties.push(...this.getFlattenedObjectProperties(ext));
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
