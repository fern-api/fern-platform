import { FdrDao, PrismaClient } from "@fern-platform/fdr";

let fdrDao: FdrDao | undefined;

export function getFdrDao() {
  if (fdrDao == null) {
    fdrDao = new FdrDao(new PrismaClient());
  }
  return fdrDao;
}
