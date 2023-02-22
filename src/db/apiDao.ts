import { PrismaClient } from "@prisma/client";

const SEED_CLOCK = 0;

export declare namespace updateOrCreateApi {
    export interface Args {
        apiId: string;
        orgName: string;
    }
    export interface Return {
        version: string;
    }
}

export async function updateOrCreateApi(
    request: updateOrCreateApi.Args,
    prisma: PrismaClient
): Promise<updateOrCreateApi.Return> {
    const apiRow = await prisma.api.findFirst({
        where: {
            apiId: request.apiId,
            orgName: request.orgName,
        },
    });
    if (apiRow == null) {
        await prisma.api.create({
            data: {
                apiId: request.apiId,
                orgName: request.orgName,
                clock: SEED_CLOCK,
            },
        });
        return { version: `0.0.${SEED_CLOCK}` };
    }
    const updatedClock = apiRow.clock + 1;
    await prisma.api.update({
        where: {
            apiId_orgName: {
                apiId: request.apiId,
                orgName: request.orgName,
            },
        },
        data: {
            apiId: request.apiId,
            orgName: request.orgName,
            clock: updatedClock,
        },
    });
    return { version: `0.0.${updatedClock}` };
}
