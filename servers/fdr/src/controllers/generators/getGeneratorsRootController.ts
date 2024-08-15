/* eslint @typescript-eslint/no-empty-function: 0 */
import { GeneratorsService } from "../../api/generated/api/resources/generators/service/GeneratorsService";
import { FdrApplication } from "../../app";

export function getGeneratorsRootController(app: FdrApplication): GeneratorsService {
    return new GeneratorsService({
        upsertGenerator: async (req, res) => {},
        getGenerator: async (req, res) => {},
        listGenerator: async (req, res) => {},
    });
}
