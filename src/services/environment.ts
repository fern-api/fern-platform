import { PrismaClient } from "@prisma/client";
import { EnvironmentService } from "../generated/api/resources/environment/service/EnvironmentService";

export function getEnvironmentService(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _prisma: PrismaClient
): EnvironmentService {
    return new EnvironmentService({
        getAll: () => {
            return {
                environments: [
                    {
                        id: "production",
                        name: "Production",
                    },
                    {
                        id: "staging",
                        name: "Staging",
                    },
                ],
            };
        },
    });
}
