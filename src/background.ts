import * as cron from "node-cron";
import { type FdrApplication } from "./app";

export function registerBackgroundTasks(app: FdrApplication) {
    registerAlgoliaIndexDeletionBackgroundTask(app);
}

export function registerAlgoliaIndexDeletionBackgroundTask(app: FdrApplication) {
    // Runs every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
        try {
            const deletedIndexCount = await app.services.algoliaIndexDeleter.deleteOldIndices({
                limit: 100,
                olderThanMinutes: 10,
            });

            app.logger.debug(`Successfully deleted ${deletedIndexCount} old indices.`);
        } catch (e) {
            app.logger.error(`Error while deleting old indices.`, e);
        }
    });
}
