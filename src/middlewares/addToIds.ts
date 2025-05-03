import ID from "../models/IDs.model";  // Import the ID model
import logEvent from "./createLogs";

async function addToIds(uuid: string, role: string): Promise<void> {
  try {
    const isFound = await ID.findOne({ uuid });  // Check if the entry already exists

    if (isFound) {
      await ID.updateOne({ uuid }, { role });  // Update the role
      await logEvent(uuid, role + " got updated");
      console.log("UUID updated successfully");
    } else {
      const IDs = new ID({ uuid, role });       // Create a new one
      await IDs.save();
      await logEvent(uuid, role + " got created");
      console.log("UUID created successfully");
    }
  } catch (error) {
    console.error("Error logging event:", error);
    throw new Error("Error logging event");
  }
}

export default addToIds;
