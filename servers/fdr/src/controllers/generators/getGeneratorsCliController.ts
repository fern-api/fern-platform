import {
    CliVersionNotFoundError,
    NoValidCliForIrError,
    NoValidClisFoundError,
} from "../../api/generated/api/resources/generators";
import { CliService } from "../../api/generated/api/resources/generators/resources/cli/service/CliService";
import { FdrApplication } from "../../app";

export function getGeneratorsCliController(app: FdrApplication): CliService {
    return new CliService({
        getLatestCliRelease: async (req, res) => {
            const maybeLatestRelease = await app.dao.cliVersions().getLatestCliRelease({
                getLatestCliReleaseRequest: req.body,
            });
            if (!maybeLatestRelease) {
                throw new NoValidClisFoundError();
            }
            return res.send(maybeLatestRelease);
        },
        getChangelog: async (req, res) => {
            return res.send(
                await app.dao.cliVersions().getChangelog({
                    fromVersion: req.params.from_version,
                    toVersion: req.params.to_version,
                }),
            );
        },
        getMinCliForIr: async (req, res) => {
            const maybeRelease = await app.dao.cliVersions().getMinCliForIr({ irVersion: req.params.ir_version });
            if (!maybeRelease) {
                throw new NoValidCliForIrError({ provided_version: req.params.ir_version });
            }
            return res.send(maybeRelease);
        },
        upsertCliRelease: async (req, res) => {
            await app.services.auth.checkUserBelongsToOrg({
                authHeader: req.headers.authorization,
                orgId: "fern",
            });

            await app.dao.cliVersions().upsertCliRelease({ cliRelease: req.body });
        },
        getCliRelease: async (req, res) => {
            const maybeRelease = await app.dao.cliVersions().getCliRelease({ cliVersion: req.params.cli_version });
            if (!maybeRelease) {
                throw new CliVersionNotFoundError({ provided_version: req.params.cli_version });
            }
            return res.send(maybeRelease);
        },
        listCliReleases: async (req, res) => {
            return res.send(
                await app.dao.cliVersions().listCliReleases({
                    page: req.query.page,
                    pageSize: req.query.page_size,
                }),
            );
        },
    });
}
