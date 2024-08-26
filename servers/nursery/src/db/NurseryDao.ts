import { PrismaClient } from "@prisma/client";
import { OwnerDao } from "./owner/OwnerDao";
import { TokenDao } from "./token/TokenDao";

export class NurseryDao {
    public owner: OwnerDao;
    public token: TokenDao;

    constructor(prisma: PrismaClient) {
        this.owner = new OwnerDao(prisma);
        this.token = new TokenDao(prisma);
    }
}
