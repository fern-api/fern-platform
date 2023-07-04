import * as cron from "node-cron";
import { type FdrApplication } from "./app";

export function registerBackgroundTasks(app: FdrApplication) {
    registerAlgoliaIndexDeletionBackgroundTask(app);
}

export function registerAlgoliaIndexDeletionBackgroundTask(app: FdrApplication) {
    // Runs every hour
    cron.schedule("0 * * * *", async () => {
        try {
            const deletedIndexCount = await app.services.algoliaIndexDeleter.deleteOldIndices({
                limit: 100,
                olderThanDays: 2,
            });

            console.log(`Successfully deleted ${deletedIndexCount} old indices.`);
        } catch (e) {
            console.log(`Error while deleting old indices.`, e);
        }
    });
}
