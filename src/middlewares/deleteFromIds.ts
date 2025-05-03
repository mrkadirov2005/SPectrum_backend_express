import ID from "../models/IDs.model";  // Import the ID model
import logEvent from "./createLogs";
async function deleteFromIds(who: string,whom:string): Promise<void> {
    // Wait for the log to be saved to the database
    try{
        const isDeleted=await ID.deleteOne({ whom });  //
        //  Delete the entry with the given UUID
        if(isDeleted.deletedCount === 0) {
            console.log("No entry found with the given UUID");  // Optional: Log confirmation
        }
        else {
            console.log("Entry deleted successfully");  // Optional: Log confirmation
        }
        logEvent(who, `Deleted entry with UUID: ${who}`);  // Log the deletion action
  } catch (error) {
    console.error("Error logging event:", error);  // Log the error
    throw new Error("Error logging event");
  }
}

export default deleteFromIds;
