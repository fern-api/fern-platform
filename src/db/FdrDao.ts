import { PrismaClient } from "@prisma/client";
import { APIDefinitionDao, APIDefinitionDaoImpl } from "./APIDefinitionDao";
import { DocsV2Dao, DocsV2DaoImpl } from "./DocsV2Dao";

export class FdrDao {
    private docsV2Dao;
    private apisDao;

    constructor(prisma: PrismaClient) {
        this.docsV2Dao = new DocsV2DaoImpl(prisma);
        this.apisDao = new APIDefinitionDaoImpl(prisma);
    }

    public docsV2(): DocsV2Dao {
        return this.docsV2Dao;
    }

    public apis(): APIDefinitionDao {
        return this.apisDao;
    }
}
