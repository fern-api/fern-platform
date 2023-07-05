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

            console.log(`Successfully deleted ${deletedIndexCount} old indices.`);
        } catch (e) {
            console.log(`Error while deleting old indices.`, e);
        }
    });
}
