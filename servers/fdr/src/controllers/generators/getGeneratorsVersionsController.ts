import { VersionsService } from "../../api/generated/api/resources/generators/resources/versions/service/VersionsService";
import { FdrApplication } from "../../app";

export function getGeneratorsVersionsController(app: FdrApplication): VersionsService {
    return new VersionsService({
        getLatestGeneratorRelease: async (req, res) => {
            return res.send(
                await app.dao.generatorVersions().getLatestGeneratorRelease({
                    getLatestGeneratorReleaseRequest: req.body,
                }),
            );
        },
        getChangelog: async (req, res) => {
            return res.send(
                await app.dao.generatorVersions().getChangelog({
                    generator: req.params.generator,
                    fromVersion: req.params.from_version,
                    toVersion: req.params.to_version,
                }),
            );
        },
        upsertGeneratorRelease: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: "fern",
            });

            await app.dao.generatorVersions().upsertGeneratorRelease({ generatorRelease: req.body });
        },
        getGeneratorRelease: async (req, res) => {
            return res.send(
                await app.dao
                    .generatorVersions()
                    .getGeneratorRelease({ generator: req.params.generator, version: req.params.version }),
            );
        },
        listGeneratorReleases: async (req, res) => {
            return res.send(
                await app.dao.generatorVersions().listGeneratorReleases({
                    generator: req.params.generator,
                    page: req.query.page,
                    pageSize: req.query.page_size,
                }),
            );
        },
    });
}
