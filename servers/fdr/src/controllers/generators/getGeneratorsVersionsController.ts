import {
    GeneratorVersionNotFoundError,
    NoValidGeneratorsFoundError,
} from "../../api/generated/api/resources/generators";
import { VersionsService } from "../../api/generated/api/resources/generators/resources/versions/service/VersionsService";
import { FdrApplication } from "../../app";

export function getGeneratorsVersionsController(app: FdrApplication): VersionsService {
    return new VersionsService({
        getLatestGeneratorRelease: async (req, res) => {
            const maybeLatestRelease = await app.dao.generatorVersions().getLatestGeneratorRelease({
                getLatestGeneratorReleaseRequest: req.body,
            });
            if (!maybeLatestRelease) {
                throw new NoValidGeneratorsFoundError();
            }

            return res.send(maybeLatestRelease);
        },
        getChangelog: async (req, res) => {
            return res.send(
                await app.dao.generatorVersions().getChangelog({
                    generator: req.params.generator,
                    versionRanges: req.body,
                }),
            );
        },
        upsertGeneratorRelease: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: "fern",
            });

            await app.dao.generatorVersions().upsertGeneratorRelease({ generatorRelease: req.body });
            return res.send();
        },
        getGeneratorRelease: async (req, res) => {
            const maybeRelease = await app.dao
                .generatorVersions()
                .getGeneratorRelease({ generator: req.params.generator, version: req.params.version });
            if (!maybeRelease) {
                throw new GeneratorVersionNotFoundError({ providedVersion: req.params.version });
            }

            return res.send(maybeRelease);
        },
        listGeneratorReleases: async (req, res) => {
            return res.send(
                await app.dao.generatorVersions().listGeneratorReleases({
                    generator: req.params.generator,
                    page: req.query.page,
                    pageSize: req.query.pageSize,
                }),
            );
        },
    });
}
