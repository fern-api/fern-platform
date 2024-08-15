/* eslint @typescript-eslint/no-empty-function: 0 */
import { UnauthorizedError } from "../../api/generated/api";
import { GeneratorsService } from "../../api/generated/api/resources/generators/service/GeneratorsService";
import { FdrApplication } from "../../app";

export function getGeneratorsRootController(app: FdrApplication): GeneratorsService {
    return new GeneratorsService({
        upsertGenerator: async (req, res) => {
            // TODO: Check admin auth
            if (req.headers.authorization === undefined) {
                throw new UnauthorizedError("You must be authorized to upload a generator");
            }

            await app.dao.generators().upsertGenerator({ generator: req.body });
            return res.send();
        },
        getGenerator: async (req, res) => {
            return res.send(await app.dao.generators().getGenerator({ generatorId: req.params.generator_id }));
        },
        listGenerators: async (_, res) => {
            return res.send(await app.dao.generators().listGenerators());
        },
    });
}
