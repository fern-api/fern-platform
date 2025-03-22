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
      const maybeLatestRelease = await app.dao
        .cliVersions()
        .getLatestCliRelease({
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
          versionRanges: req.body,
        })
      );
    },
    getMinCliForIr: async (req, res) => {
      const irVersion = Number(req.params.irVersion);
      const maybeRelease = await app.dao
        .cliVersions()
        .getMinCliForIr({ irVersion });
      if (!maybeRelease) {
        throw new NoValidCliForIrError({ providedVersion: irVersion });
      }
      return res.send(maybeRelease);
    },
    upsertCliRelease: async (req) => {
      await app.services.auth.checkUserBelongsToOrg({
        authHeader: req.headers.authorization,
        orgId: "fern",
      });

      await app.dao.cliVersions().upsertCliRelease({ cliRelease: req.body });
    },
    getCliRelease: async (req, res) => {
      const maybeRelease = await app.dao
        .cliVersions()
        .getCliRelease({ cliVersion: req.params.cliVersion });
      if (!maybeRelease) {
        throw new CliVersionNotFoundError({
          providedVersion: req.params.cliVersion,
        });
      }
      return res.send(maybeRelease);
    },
    listCliReleases: async (req, res) => {
      return res.send(
        await app.dao.cliVersions().listCliReleases({
          page: req.query.page,
          pageSize: req.query.pageSize,
        })
      );
    },
  });
}
