import { PrismaClient } from "@prisma/client";
import { APIDefinitionDao, APIDefinitionDaoImpl } from "./api/APIDefinitionDao";
import { DocsV2Dao, DocsV2DaoImpl } from "./docs/DocsV2Dao";
import { IndexSegmentDaoImpl, type IndexSegmentDao } from "./docs/IndexSegmentDao";
import { SnippetAPIsDaoImpl, type SnippetAPIsDao } from "./snippetApis/SnippetAPIsDao";
import { SnippetsDaoImpl, type SnippetsDao } from "./snippets/SnippetsDao";
import { SdkDao, SdkDaoImpl } from "./sdk/SdkDao";

export class FdrDao {
    private docsV2Dao;
    private apisDao;
    private indexSegmentDao;
    private snippetsDao;
    private snippetAPIsDao;
    private sdksDao;

    constructor(prisma: PrismaClient) {
        this.docsV2Dao = new DocsV2DaoImpl(prisma);
        this.apisDao = new APIDefinitionDaoImpl(prisma);
        this.indexSegmentDao = new IndexSegmentDaoImpl(prisma);
        this.snippetsDao = new SnippetsDaoImpl(prisma);
        this.snippetAPIsDao = new SnippetAPIsDaoImpl(prisma);
        this.sdksDao = new SdkDaoImpl(prisma);
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

    public sdks(): SdkDao {
        return this.sdksDao;
    }
}
