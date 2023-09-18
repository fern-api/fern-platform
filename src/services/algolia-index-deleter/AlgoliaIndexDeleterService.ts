import type { FdrApplication } from "../../app";

const MILLISECONDS_IN_ONE_MINUTE = 60 * 1_000;
const MILLISECONDS_IN_ONE_HOUR = 60 * MILLISECONDS_IN_ONE_MINUTE;

interface DeleteOldIndicesParams {
    olderThanMinutes?: number;
    limit?: number;
}

interface DeleteOldIndexSegmentsParams {
    olderThanHours?: number;
}

export interface AlgoliaIndexDeleterService {
    deleteOldIndices(params: DeleteOldIndicesParams): Promise<number>;

    deleteOldIndexSegments(indexName: string, params: DeleteOldIndexSegmentsParams): Promise<void>;
}

export class AlgoliaIndexDeleterServiceImpl implements AlgoliaIndexDeleterService {
    private static config = {
        maxIndexSegmentsToQuery: 1_000,
    };

    private get db() {
        return this.app.services.db;
    }

    private get algolia() {
        return this.app.services.algolia;
    }

    constructor(private readonly app: FdrApplication) {}

    public async deleteOldIndices(params: DeleteOldIndicesParams) {
        const { limit, olderThanMinutes = 10 } = params;
        const records = await this.db.prisma.overwrittenAlgoliaIndex.findMany({
            take: limit,
            where: {
                overwrittenTime: {
                    lte: new Date(Date.now() - olderThanMinutes * MILLISECONDS_IN_ONE_MINUTE),
                },
            },
        });
        await Promise.all(
            records.map(async ({ indexId }) => {
                await this.algolia.deleteIndex(indexId);
                await this.db.prisma.overwrittenAlgoliaIndex.delete({
                    where: { indexId },
                });
            })
        );
        return records.length;
    }

    public async deleteOldIndexSegments(indexName: string, params: DeleteOldIndexSegmentsParams) {
        const { olderThanHours = 24 } = params;

        const inactiveOldIndexSegmentIds = await this.db.prisma.$transaction(async (tx) => {
            const activeIndexSegmentIds = await (async () => {
                const docsRecords = await tx.docsV2.findMany({
                    select: { indexSegmentIds: true },
                });
                return docsRecords
                    .map((r) => (Array.isArray(r.indexSegmentIds) ? r.indexSegmentIds : []))
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
                            lte: new Date(Date.now() - olderThanHours * MILLISECONDS_IN_ONE_HOUR),
                        },
                    },
                    select: { id: true },
                    take: AlgoliaIndexDeleterServiceImpl.config.maxIndexSegmentsToQuery,
                });
                return indexSegmentRecords.map((r) => r.id).filter((id) => !activeIndexSegmentIds.has(id));
            })();

            return inactiveOldIndexSegmentIds;
        });

        for (const indexSegmentId of inactiveOldIndexSegmentIds) {
            await this.deleteIndexSegmentAndNotifySlackIfFails(indexName, indexSegmentId);
        }
    }

    private async deleteIndexSegmentAndNotifySlackIfFails(indexName: string, indexSegmentId: string) {
        try {
            await this.app.services.algolia.deleteIndexSegmentRecords(indexName, [indexSegmentId]);
            await this.db.prisma.indexSegment.delete({
                where: { id: indexSegmentId },
            });
        } catch (err) {
            await this.app.services.slack.notifyFailedToDeleteIndexSegment({ indexSegmentId, err });
        }
    }
}
