"use server";

import { DocsV2Read } from "@fern-api/fdr-sdk";
import { FdrDao, PrismaClient } from "@fern-platform/fdr";

export async function loadFromDb(): Promise<DocsV2Read.ListAllDocsUrlsResponse> {
  const prisma = new PrismaClient();
  const fdrDao = new FdrDao(prisma);
  return fdrDao.docsV2().listAllDocsUrls({
    domainSuffix: ".com",
  });
}
