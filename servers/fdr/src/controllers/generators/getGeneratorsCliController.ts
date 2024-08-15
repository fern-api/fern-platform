/* eslint @typescript-eslint/no-empty-function: 0 */
import { CliService } from "../../api/generated/api/resources/generators/resources/cli/service/CliService";
import { FdrApplication } from "../../app";

export function getGeneratorsCliController(app: FdrApplication): CliService {
    return new CliService({
        getLatestCliRelease: async (req, res) => {},
        getChangelog: async (req, res) => {},
        getMinCliForIr: async (req, res) => {},
        upsertCliRelease: async (req, res) => {},
        getCliRelease: async (req, res) => {},
        getAllCliReleases: async (req, res) => {},
    });
}
