import { Request, Response } from 'express';
import Staff from '../models/Staff.model';
import Admin from '../models/Admin.model';
import Group from '../models/Group.model'; // Import Group model
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import logEvent from '../middlewares/createLogs';
import addToIds from '../middlewares/addToIds';
import deleteFromIds from '../middlewares/deleteFromIds';

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key';
const getAdminUuidFromToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  // console.log("her eis the token",token)
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key') as { uuid?: string };
    console.log("Decoded token",decoded)
    return decoded.uuid || null;
  } catch {
    console.error('Invalid token:', token);
    return null;
  }
};

// CREATE STAFF — Only Admin Can Create
export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized: Token missing' });
      return;
    }

    // Decode JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as { uuid: string };
    const admin_uuid = decoded.uuid;

    // Check if admin exists
    const admin = await Admin.findOne({ uuid: admin_uuid });
    if (!admin) {
      res.status(403).json({ message: 'Unauthorized: Admin not found' });
      return;
    }

    const {
      first_name,
      last_name,
      username,
      password,
      email,
      position,
      isActive,
      schedule,
      accessModule,
      attendance,
      adminId,
      uuid,
      survay
    } = req.body;

    const staff = new Staff({
      first_name,
      last_name,
      username,
      password,
      email,
      position,
      isActive,
      schedule,
      accessModule,
      attendance,
      adminId,
      survay,
      uuid: uuid || uuidv4(),
    });

    await staff.save();
    logEvent(admin_uuid, `Staff with UUID ${staff.uuid} created by admin with UUID ${admin_uuid}`);
    addToIds(staff.uuid, "Staff");
    // Add the staff UUID to the admin's staff list if it doesn't already exist
    // Log the action (who created the staff and when)
    const logMessage = `Staff created: ${first_name} ${last_name} (${staff.uuid}), by Admin (${admin_uuid}), date: ${new Date()}`;
    admin.logs.push(logMessage);
    await admin.save();

    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
};

// GET ALL STAFF
export const getAllStaff = async (_req: Request, res: Response): Promise<void> => {
  if(getAdminUuidFromToken(_req) == null){
    res.status(401).json({ message: 'Unauthorized: Token missing or unauthorized request' });
    return;
  };
  try {
    const staffList = await Staff.find();
    // todo change here so it only return the staff that belongs to the admin
    res.status(200).json(staffList);

    // Log the action (who fetched the staff and when)
    const token = _req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, SECRET_KEY) as { uuid: string };
      const admin_uuid = decoded.uuid;

      const admin = await Admin.findOne({ uuid: admin_uuid });
      if (admin) {
        const logMessage = `Admin (${admin_uuid}) fetched all staff records, date: ${new Date()}`;
        admin.logs.push(logMessage);
        await admin.save();
      }
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// GET STAFF BY UUID
export const getStaffByUuid = async (req: Request, res: Response): Promise<void> => {
  const adminId=getAdminUuidFromToken(req);
  if(!adminId) { 
    res.status(401).json({message:"Admin Id was not provided"})
  return;
}
  try {
    const staff = await Staff.findOne({ uuid: req.body.uuid });
    if (!staff) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }
if(req.body.uuid!=staff.uuid){
  res.status(400).json({ message: 'Bad Request: UUID is required' });
  return;
}
res.status(200).json(staff);

    // Log the action (who fetched the staff by UUID and when)
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, SECRET_KEY) as { uuid: string };
      const admin_uuid = decoded.uuid;

      const admin = await Admin.findOne({ uuid: admin_uuid });
      if (admin) {
        const logMessage = `Admin (${admin_uuid}) fetched staff record with UUID: ${staff.uuid}, date: ${new Date()}`;
        admin.logs.push(logMessage);
        await admin.save();
      }
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// UPDATE STAFF
export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  const adminId=getAdminUuidFromToken(req)
  if(!adminId) { 
    res.status(401).json({message:"Admin Id was not provided"})
  return;
}
  try {
    const updated = await Staff.findOneAndUpdate({ uuid: req.body.uuid }, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Staff not found to update' });
      return;
    }

    res.status(200).json(updated);

    // Log the action (who updated the staff and when)
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, SECRET_KEY) as { uuid: string };
      const admin_uuid = decoded.uuid;

      const admin = await Admin.findOne({ uuid: admin_uuid });
      if (admin) {
        await admin.save();
        logEvent(adminId,"Admin with id "+adminId+"updated staff with id "+req.body.uuid)
      }
    }
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// DELETE STAFF
export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  if(getAdminUuidFromToken(req) == null){
    res.status(401).json({ message: 'Unauthorized: Token missing' }); 
    return;
  }
  try {
    const deleted = await Staff.findOneAndDelete({ uuid: req.body.uuid });
    if (!deleted) {
      res.status(404).json({ message: 'Staff not found to delete' });
      return;
    }
if(!req.body.uuid){
  res.status(400).json({ message: 'Bad Request: UUID is required' });
  return;
}
    res.status(200).json({ message: 'Staff deleted successfully' });

    // Log the action (who deleted the staff and when)
  // logEvent(getAdminUuidFromToken(req) || '', `Staff with UUID ${deleted.uuid} deleted by admin with UUID ${getAdminUuidFromToken(req)}`);
  deleteFromIds(getAdminUuidFromToken(req) || '', req.body.uuid);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// GET MY GROUPS — Staff can see groups assigned to them (client_id matches staff.uuid)
export const getMyGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized: Token missing' });
      return;
    }

    // Decode JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as { uuid: string };
    const staff_uuid = decoded.uuid;

    // Find staff member (Optional, you can just rely on token)
    const staff = await Staff.findOne({ uuid: staff_uuid });
    if (!staff) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }

    // Fetch groups where the client_id is the same as the staff's uuid (client_id in Group is linked to staff.uuid)
    const groups = await Group.find({ client_id: staff_uuid });

    if (groups.length === 0) {
      res.status(404).json({ message: 'No groups assigned to this staff member' });
      return;
    }

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};
