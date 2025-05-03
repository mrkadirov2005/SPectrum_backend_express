import { Request, Response } from 'express';
import Log from '../models/Logs.model'; // Import Log model
import { get } from 'http';
import getClientUuidFromToken from '../middlewares/extractUUID';
import Ids from '../models/IDs.model';
import AdminModel from '../models/Admin.model';
import StaffModel from '../models/Staff.model';
import StudentModel from '../models/Student.model';

// Define the types for query parameters
interface LogQuery {
  userUuid?: string;
  startDate?: string;
  endDate?: string;
}

// Define the types for the body when creating a log
interface CreateLogBody {
  userUuid: string;
  message: string;
}

// GET ALL LOGS — Fetch all logs (with optional filters)
export const getAllLogs = async (req: Request<{}, {}, {}, LogQuery>, res: Response): Promise<void> => {
  try {
    const { userUuid, startDate, endDate } = req.query;
    
    let filter: any = {};

    // Optional filters based on query parameters
    if (userUuid) filter.userUuid = userUuid;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const logs = await Log.find(filter).sort({ date: -1 }); // Sort logs by date, descending
    if (logs.length === 0) {
      res.status(404).json({ message: 'No logs found' });
      return;
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET LOGS BY USER UUID — Fetch logs for a specific user by UUID
export const getWholeLogs = async (req: Request, res: Response): Promise<void> => {
  const token=getClientUuidFromToken(req)
  try {

  if(!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const cliendRole=await Ids.findOne({uuid:token})
  if(cliendRole==null) {
    res.status(401).json({ message: 'You are not a member of Spectrum Academy' });
    return;
  }
  if(cliendRole.role!=="Admin" && cliendRole.role!=="Client") {
    res.status(401).json({ message: 'You are not an admin' });
    return;
  }
  const adminLogs=await AdminModel.find({client_id:token})
  const staffLogs=await StaffModel.find({client_id:token})

  
// TODO implement the logic here that client gets only its staff logs, and admin gets all staff logs and staff gets its own logs

const allLogs=await Log.find().sort({date:-1})
    res.status(200).json({message:allLogs});
    
    return 
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const getLogsByUserUuid = async (req: Request<{ userUuid: string }, {}, {}, {}>, res: Response): Promise<void> => {
  try {
  const userUuid=getClientUuidFromToken(req)


    const logs = await Log.find({ userUuid }).sort({ date: -1 }); // Sort logs by date, descending

    if (logs.length === 0) {
      res.status(404).json({ message: `No logs found for user with UUID: ${userUuid}` });
      return;
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// CREATE LOG — You might not need this for admin, but can use it internally if needed (e.g., to manually log actions)
export const createLog = async (req: Request<{}, {}, CreateLogBody, {}>, res: Response): Promise<void> => {
  try {
    const { userUuid, message } = req.body;
    
    if (!userUuid || !message) {
      res.status(400).json({ message: 'User UUID and message are required' });
      return;
    }

    const log = new Log({
      userUuid,
      message,
      date: new Date(),
    });

    await log.save();

    res.status(201).json({ message: 'Log created successfully', log });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
