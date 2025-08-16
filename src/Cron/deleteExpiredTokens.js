import cron from "node-cron";
import revokeTokenModel from "../DB/Models/revokeToken.model.js";

cron.schedule("0 * * * *", async () => {
    console.log(" Running cron job to delete expired tokens...");

    const now = new Date();

    try {
        const result = await revokeTokenModel.deleteMany({
            expireAt: { $lt: now.toISOString() }
        });

        console.log(` Deleted ${result.deletedCount} expired tokens`);
    } catch (error) {
        console.error(" Error deleting expired tokens:", error);
    }
});
