import { PrismaClient } from "@prisma/client";

export class TokenDao {
    public constructor(private readonly prisma: PrismaClient) {}

    public async createOwner({ ownerId, data }: { ownerId: string; data: Record<string, unknown> }): Promise<void> {
        this.prisma.owner.create({
            data: {
                data: ,
                ownerId,
            },
        });
    }

    public async getOwner(ownerId: string): Promise<Owner> {}

    public async updateOwner({ ownerId, data }: { ownerId: string; data: Record<string, unknown> }): Promise<Owner> {}
}
