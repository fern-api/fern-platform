import type { FdrApplication } from "../../app";

const MILLISECONDS_IN_ONE_MINUTE = 60 * 1_000;
const MILLISECONDS_IN_ONE_HOUR = 60 * MILLISECONDS_IN_ONE_MINUTE;

interface DeleteOldIndexSegmentsParams {
  olderThanHours?: number;
}

export interface AlgoliaIndexSegmentDeleterService {
  deleteOldInactiveIndexSegments(
    params: DeleteOldIndexSegmentsParams
  ): Promise<number>;
}

export class AlgoliaIndexSegmentDeleterServiceImpl
  implements AlgoliaIndexSegmentDeleterService
{
  private static config = {
    maxIndexSegmentsToQuery: 1_000,
  };

  private get db() {
    return this.app.services.db;
  }

  constructor(private readonly app: FdrApplication) {}

  public async deleteOldInactiveIndexSegments(
    params: DeleteOldIndexSegmentsParams
  ) {
    const { olderThanHours = 24 } = params;

    const inactiveOldIndexSegmentIds = await this.db.prisma.$transaction(
      async (tx) => {
        const activeIndexSegmentIds = await (async () => {
          const docsRecords = await tx.docsV2.findMany({
            select: { indexSegmentIds: true },
          });
          return docsRecords
            .map((r) =>
              Array.isArray(r.indexSegmentIds) ? r.indexSegmentIds : []
            )
            .reduce((acc, indexSegmentIds) => {
              indexSegmentIds.forEach((indexSegmentId) => {
                if (typeof indexSegmentId === "string") {
                  acc.add(indexSegmentId);
                }
              });
              return acc;
            }, new Set<string>());
        })();

        const inactiveOldIndexSegmentIds = await (async () => {
          const indexSegmentRecords = await tx.indexSegment.findMany({
            where: {
              createdAt: {
                lte: new Date(
                  Date.now() - olderThanHours * MILLISECONDS_IN_ONE_HOUR
                ),
              },
            },
            select: { id: true },
            take: AlgoliaIndexSegmentDeleterServiceImpl.config
              .maxIndexSegmentsToQuery,
          });
          return indexSegmentRecords
            .map((r) => r.id)
            .filter((id) => !activeIndexSegmentIds.has(id));
        })();

        return inactiveOldIndexSegmentIds;
      }
    );

    for (const indexSegmentId of inactiveOldIndexSegmentIds) {
      await this.deleteIndexSegmentAndNotifySlackIfFails(indexSegmentId);
    }

    return inactiveOldIndexSegmentIds.length;
  }

  private async deleteIndexSegmentAndNotifySlackIfFails(
    indexSegmentId: string
  ) {
    try {
      await this.app.services.algolia.deleteIndexSegmentRecords([
        indexSegmentId,
      ]);
      await this.db.prisma.indexSegment.delete({
        where: { id: indexSegmentId },
      });
    } catch (err) {
      // await this.app.services.slack.notifyFailedToDeleteIndexSegment({ indexSegmentId, err });
    }
  }
}
