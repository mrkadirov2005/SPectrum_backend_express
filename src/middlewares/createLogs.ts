import Log from "../models/Logs.model";

async function logEvent(uuid: string, message: string): Promise<void> {
  try {
    const log = new Log({
      userUuid: uuid,
      message,
      date: new Date(),
    });

    // Wait for the log to be saved to the database
    await log.save();
    console.log("Log saved successfully");  // Optional: Log confirmation

  } catch (error) {
    console.error("Error logging event:", error);  // Log the error
    throw new Error("Error logging event");
  }
}

export default logEvent;
