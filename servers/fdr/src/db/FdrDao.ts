import { PrismaClient } from "@prisma/client";
import { S3Service } from "../services/s3";
import { APIDefinitionDao, APIDefinitionDaoImpl } from "./api/APIDefinitionDao";
import { DocsV2Dao, DocsV2DaoImpl } from "./docs/DocsV2Dao";
import {
  IndexSegmentDaoImpl,
  type IndexSegmentDao,
} from "./docs/IndexSegmentDao";
import { CliVersionsDaoImpl } from "./generators/CliVersionsDao";
import { GeneratorsDaoImpl } from "./generators/GeneratorDao";
import { GeneratorVersionsDaoImpl } from "./generators/GeneratorVersionsDao";
import { GitDaoImpl } from "./git/GitDao";
import { DocsRegistrationDao } from "./registrations/DocsRegistrationDao";
import { SdkDao, SdkDaoImpl } from "./sdk/SdkDao";
import {
  SnippetAPIsDaoImpl,
  type SnippetAPIsDao,
} from "./snippetApis/SnippetAPIsDao";
import {
  SnippetTemplateDao,
  SnippetTemplateDaoImpl,
} from "./snippets/SnippetTemplate";
import { SnippetsDaoImpl, type SnippetsDao } from "./snippets/SnippetsDao";

export class FdrDao {
  private docsV2Dao;
  private apisDao;
  private indexSegmentDao;
  private snippetsDao;
  private snippetTemplateDao;
  private snippetAPIsDao;
  private sdksDao;
  private docsRegistrationDao;
  private generatorsDao;
  private generatorVersionsDao;
  private cliVersionsDao;
  private gitDao;

  constructor(prisma: PrismaClient, s3: S3Service) {
    this.docsV2Dao = new DocsV2DaoImpl(prisma);
    this.apisDao = new APIDefinitionDaoImpl(prisma, s3);
    this.indexSegmentDao = new IndexSegmentDaoImpl(prisma);
    this.snippetsDao = new SnippetsDaoImpl(prisma);
    this.snippetAPIsDao = new SnippetAPIsDaoImpl(prisma);
    this.sdksDao = new SdkDaoImpl(prisma);
    this.snippetTemplateDao = new SnippetTemplateDaoImpl(prisma);
    this.docsRegistrationDao = new DocsRegistrationDao(prisma);
    this.generatorsDao = new GeneratorsDaoImpl(prisma);
    this.generatorVersionsDao = new GeneratorVersionsDaoImpl(prisma);
    this.cliVersionsDao = new CliVersionsDaoImpl(prisma);
    this.gitDao = new GitDaoImpl(prisma);
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

  public snippetTemplates(): SnippetTemplateDao {
    return this.snippetTemplateDao;
  }

  public sdks(): SdkDao {
    return this.sdksDao;
  }

  public docsRegistration(): DocsRegistrationDao {
    return this.docsRegistrationDao;
  }

  public generators(): GeneratorsDaoImpl {
    return this.generatorsDao;
  }

  public generatorVersions(): GeneratorVersionsDaoImpl {
    return this.generatorVersionsDao;
  }

  public cliVersions(): CliVersionsDaoImpl {
    return this.cliVersionsDao;
  }

  public git(): GitDaoImpl {
    return this.gitDao;
  }
}
