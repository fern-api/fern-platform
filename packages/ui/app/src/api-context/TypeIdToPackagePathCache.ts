import { APIV1Read } from "@fern-api/fdr-sdk";
import { PackagePath } from "../commons/PackagePath";

export class TypeIdToPackagePathCache {
    private cache: Record<APIV1Read.TypeId, PackagePath> = {};

    constructor(
        apiDefinition: APIV1Read.ApiDefinition,
        resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage
    ) {
        this.addPackageToCache(apiDefinition.rootPackage, resolveSubpackageById, []);
    }

    public get(typeId: APIV1Read.TypeId): PackagePath {
        const packagePath = this.cache[typeId];
        if (packagePath == null) {
            throw new Error("Type ID does not exist: " + typeId);
        }
        return packagePath;
    }

    private addPackageToCache(
        package_: APIV1Read.ApiDefinitionPackage,
        resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage,
        packagePath: PackagePath
    ): void {
        for (const typeId of package_.types) {
            this.cache[typeId] = packagePath;
        }
        for (const subpackageId of package_.subpackages) {
            const subpackage = resolveSubpackageById(subpackageId);
            this.addPackageToCache(subpackage, resolveSubpackageById, [...packagePath, subpackage.name]);
        }
    }
}
