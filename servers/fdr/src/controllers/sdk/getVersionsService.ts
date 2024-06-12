import { VersionsService } from "../../api/generated/api/resources/sdks/resources/versions/service/VersionsService";
import { FdrApplication } from "../../app";

export function getVersionsService(app: FdrApplication): VersionsService {
    return new VersionsService({
        computeSemanticVersion: () => {},
    });
}
