import type { FdrApplication } from "../../app";

const MILLISECONDS_IN_ONE_MINUTE = 60 * 1_000;

interface DeleteOldIndicesParams {
    olderThanMinutes?: number;
    limit?: number;
}

export interface AlgoliaIndexDeleterService {
    deleteOldIndices(params: DeleteOldIndicesParams): Promise<number>;
}

export class AlgoliaIndexDeleterServiceImpl implements AlgoliaIndexDeleterService {
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
}
