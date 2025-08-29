import { io } from "./socket";

export const updateStatus = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  statusField: string,
  startDateField: string,
  durationField?: string // Event duration field in minutes
) => {
  try {
    const now = new Date();
    console.log(`[CRON] Checking status updates at ${now.toISOString()}`);

    // ✅ Step 1: "upcoming" → "ongoing"
    const upcomingItems = await model.find({
      [statusField]: "upcoming",
      [startDateField]: { $lte: now }, // Start time reached
    });

    for (const item of upcomingItems) {
      item[statusField] = "ongoing";
      await item.save();
      console.log(`[CRON] Updated ${model.modelName} ${item._id} to ongoing`);
    }

    // ✅ Step 2: "ongoing" → "finished" (after event duration)
    if (durationField) {
      const ongoingItems = await model.find({ [statusField]: "ongoing" });

      for (const item of ongoingItems) {
        const startDate = new Date(item[startDateField]);
        const eventDuration = item[durationField]; // Duration in minutes

        const endTime = new Date(startDate.getTime() + eventDuration * 60 * 1000); 

        if (now >= endTime) {
          item[statusField] = "finished";
          await item.save();
          console.log(`[CRON] Updated ${model.modelName} ${item._id} to finished`);
        }
      }
    }

    io.emit(`${model.modelName.toLowerCase()}Update`, await model.find());
  } catch (error) {
    console.error(`Error updating ${model.modelName} status:`, error);
  }
};


