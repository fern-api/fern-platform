import { ReadmeService } from "../../api/generated/api/resources/generatorCli/resources/readme/service/ReadmeService";
import { type FdrApplication } from "../../app";

export function getReadmeService(app: FdrApplication): ReadmeService {
    return new ReadmeService({
        generate: async (req, res) => {
            // TODO: Implement me! This will take the same form as the CLI entrypoint.
            // TODO: We will need to import generator-exec from here.
            return;
        },
    });
}
