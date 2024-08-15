import { VersionsService } from "../../api/generated/api/resources/generators/resources/versions/service/VersionsService";
import { FdrApplication } from "../../app";

export function getGeneratorsVersionsController(app: FdrApplication): VersionsService {
    return new VersionsService({
        getLatestGeneratorVersion: async (req, res) => {},
        getChangelog: async (req, res) => {},
        upsertGeneratorRelease: async (req, res) => {},
        getGeneratorRelease: async (req, res) => {},
        getAllGeneratorReleases: async (req, res) => {},
    });
}
