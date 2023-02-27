import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { AuthUtils } from "../AuthUtils";
import { EnvironmentService } from "../generated/api/resources/environment/service/EnvironmentService";

export function getEnvironmentService(prisma: PrismaClient, authUtils: AuthUtils): EnvironmentService {
    return new EnvironmentService({
        getAll: async (req, res) => {
            await authUtils.checkUserBelongsToOrg({ authHeader: req.headers.authorization, orgId: req.params.orgId });
            const environments = await prisma.environments.findMany({ where: { orgId: req.params.orgId } });
            await res.send({
                environments: environments.map((environment) => {
                    return {
                        id: environment.environmentId,
                        name: environment.name,
                        url: environment.url,
                    };
                }),
            });
        },
        create: async (req, res) => {
            await authUtils.checkUserBelongsToOrg({ authHeader: req.headers.authorization, orgId: req.params.orgId });
            const environmentId = uuidv4();
            await prisma.environments.create({
                data: {
                    environmentId,
                    orgId: req.params.orgId,
                    name: req.body.name,
                    url: req.body.url,
                },
            });
            await res.send(environmentId);
        },
        delete: async (req, res) => {
            await authUtils.checkUserBelongsToOrg({ authHeader: req.headers.authorization, orgId: req.params.orgId });
            await prisma.environments.delete({
                where: {
                    orgId_environmentId: {
                        environmentId: req.params.environmentId,
                        orgId: req.params.orgId,
                    },
                },
            });
            await res.send();
        },
    });
}
