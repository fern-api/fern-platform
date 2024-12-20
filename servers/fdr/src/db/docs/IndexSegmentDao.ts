import { PrismaClient } from "@prisma/client";

export interface LoadIndexSegmentResponse {
  id: string;
  createdAt: Date;
  version: string | undefined;
}

export interface IndexSegmentDao {
  loadIndexSegment(
    indexSegmentId: string
  ): Promise<LoadIndexSegmentResponse | undefined>;
}

export class IndexSegmentDaoImpl implements IndexSegmentDao {
  constructor(private readonly prisma: PrismaClient) {}

  public async loadIndexSegment(
    indexSegmentId: string
  ): Promise<LoadIndexSegmentResponse | undefined> {
    const record = await this.prisma.indexSegment.findFirst({
      where: { id: indexSegmentId },
    });
    return record != null
      ? {
          id: record.id,
          createdAt: record.createdAt,
          version: record.version ?? undefined,
        }
      : undefined;
  }
}
