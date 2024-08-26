import { PrismaClient } from "@prisma/client";
import { Owner } from "../api/generated/api";
import { readBuffer, writeBuffer } from "../utils/buffer";

export class OwnerDao {
    public constructor(private readonly prisma: PrismaClient) {}

    public async createOwner({ ownerId, data }: { ownerId: string; data: Record<string, unknown> }): Promise<void> {
        await this.prisma.owner.create({
            data: {
                data: writeBuffer(data),
                ownerId,
            },
        });
    }

    public async getOwner(ownerId: string): Promise<Owner | undefined> {
        const response = await this.prisma.owner.findFirst({
            select: {
                ownerId: true,
                data: true,
            },
            where: {
                ownerId,
            },
        });
        if (response == null) {
            return undefined;
        }
        return {
            data: readBuffer(response.data),
            ownerId,
        };
    }

    public async updateOwner({ ownerId, data }: { ownerId: string; data: Record<string, unknown> }): Promise<Owner> {
        throw new Error();
    }
}
