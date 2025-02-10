// Types that are stored in the DB
import { PrismaClient } from "@prisma/client";

export type ReferencedAPIDefinitionIds = string[];
export type IndexSegmentIds = string[];

// Prisma Transaction Type
export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export type SdkId = string;
