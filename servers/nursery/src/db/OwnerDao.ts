import { PrismaClient } from "@prisma/client";
import { writeBuffer } from "../utils/buffer";

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

    public async getOwner(ownerId: string): Promise<Owner> {
        await this.prisma.owner.findFirst({
            select: {
                ownerId,
            },
            data: {
                data: writeBuffer(data),
                ownerId,
            },
        });
    }

    public async updateOwner({ ownerId, data }: { ownerId: string; data: Record<string, unknown> }): Promise<Owner> {}
}
