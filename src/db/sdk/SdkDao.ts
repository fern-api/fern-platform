import { PrismaClient } from "@prisma/client";
import { SdkId } from "../types";

export interface SdkDao {
    getLatestSdkIdsForPackages(sdkPackages: string[]): Promise<Record<string, SdkId>>;

    getLatestSdkIdForPackage(sdkPackages: string): Promise<SdkId | undefined>;
}

export class SdkDaoImpl implements SdkDao {
    constructor(private readonly prisma: PrismaClient) {}

    public async getLatestSdkIdsForPackages(sdkPackages: string[]): Promise<Record<SdkId, string>> {
        const sdkIds: Record<string, SdkId> = {};
        for (const sdkPackage of sdkPackages) {
            const sdkId = await this.getLatestSdkIdForPackage(sdkPackage);
            if (sdkId != null) {
                sdkIds[sdkPackage] = sdkId;
            }
        }
        return sdkIds;
    }

    public async getLatestSdkIdForPackage(sdkPackage: string): Promise<string | undefined> {
        const sdkRow = await this.prisma.sdk.findFirst({
            select: {
                id: true,
            },
            where: {
                package: sdkPackage,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return sdkRow?.id;
    }
}
