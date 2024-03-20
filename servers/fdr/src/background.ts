import * as cron from "node-cron";
import { type FdrApplication } from "./app";

export function registerBackgroundTasks(app: FdrApplication) {
    registerAlgoliaSearchRecordDeletionBackgroundTask(app);
}

export function registerAlgoliaSearchRecordDeletionBackgroundTask(app: FdrApplication) {
    // Runs every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
        try {
            const deletedIndexSegmentCount =
                await app.services.algoliaIndexSegmentDeleter.deleteOldInactiveIndexSegments({
                    olderThanHours: 24,
                });
            app.logger.debug(`Successfully deleted ${deletedIndexSegmentCount} old index segments.`);
        } catch (e) {
            app.logger.error("Error while deleting old index segments.", e);
        }
    });
}
