import { PrismaClient } from "@prisma/client";
import { Owner } from "../api/generated/api";

export class TokenDao {
    public constructor(private readonly prisma: PrismaClient) {}

    public async createOwner({ ownerId, data }: { ownerId: string; data: Record<string, unknown> }): Promise<void> {
        throw new Error();
    }

    public async getOwner(ownerId: string): Promise<Owner> {
        throw new Error();
    }

    public async updateOwner({ ownerId, data }: { ownerId: string; data: Record<string, unknown> }): Promise<Owner> {
        throw new Error();
    }
}
