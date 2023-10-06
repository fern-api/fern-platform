import { PrismaClient } from "@prisma/client";
import { APIDefinitionDao, APIDefinitionDaoImpl } from "./APIDefinitionDao";
import { DocsV2Dao, DocsV2DaoImpl } from "./DocsV2Dao";
import { IndexSegmentDaoImpl, type IndexSegmentDao } from "./IndexSegmentDao";
import { SnippetAPIsDaoImpl, type SnippetAPIsDao } from "./SnippetAPIsDao";
import { SnippetsDaoImpl, type SnippetsDao } from "./SnippetsDao";

export class FdrDao {
    private docsV2Dao;
    private apisDao;
    private indexSegmentDao;
    private snippetsDao;
    private snippetAPIsDao;

    constructor(prisma: PrismaClient) {
        this.docsV2Dao = new DocsV2DaoImpl(prisma);
        this.apisDao = new APIDefinitionDaoImpl(prisma);
        this.indexSegmentDao = new IndexSegmentDaoImpl(prisma);
        this.snippetsDao = new SnippetsDaoImpl(prisma);
        this.snippetAPIsDao = new SnippetAPIsDaoImpl(prisma);
    }

    public docsV2(): DocsV2Dao {
        return this.docsV2Dao;
    }

    public apis(): APIDefinitionDao {
        return this.apisDao;
    }

    public indexSegment(): IndexSegmentDao {
        return this.indexSegmentDao;
    }

    public snippets(): SnippetsDao {
        return this.snippetsDao;
    }

    public snippetAPIs(): SnippetAPIsDao {
        return this.snippetAPIsDao;
    }
}
