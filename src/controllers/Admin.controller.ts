import { Request, Response } from 'express';
import Admin from '../models/Admin.model';
import Client from '../models/Client.model';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import GroupModel from '../models/Group.model';
import logEvent from '../middlewares/createLogs';
import addToIds from '../middlewares/addToIds';
import { log } from 'console';
import deleteFromIds from '../middlewares/deleteFromIds';
import { IAdmin } from '../../Interfaces/Admin.interface';

// Helper to extract client UUID from token
const getClientUuidFromToken = (req: Request): string | null => {
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

// CREATE ADMIN
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const clientUuid = getClientUuidFromToken(req);
    if (!clientUuid) {
        res.status(401).json({ message: 'Unauthorized: No client token' });
        return
      ;
    }

    const client = await Client.findOne({ uuid: clientUuid });
    if (!client) {
      res.status(403).json({ message: 'Forbidden: Client not found' });
      return;
    }

    const { email, password, username, is_active, accessible_groups_list, uuid,client_id } = req.body;

    const newAdmin = new Admin({
      email,
      password,
      username,
      is_active,
      accessible_groups_list,
      client_id,
      uuid: uuid || uuidv4(),
      logs: [], // Initialize logs as an empty array
    });
    logEvent('Admin created by ' + clientUuid, clientUuid); // Log the event
    addToIds(newAdmin.uuid, "Admin"); // Log the action in the IDs table
    await newAdmin.save();
    res.status(201).json(newAdmin);
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// GET ALL ADMINS
export const getAdmins = async (_req: Request, res: Response) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// GET ADMIN BY UUID
export const getAdminByUuid = async (req: Request, res: Response) => {
  const clientUuid = getClientUuidFromToken(req);
  if (!clientUuid) {
     res.status(401).json({ message: 'Unauthorized: No client token' });
     return;
  }
  const {uuid} =req.body;
  try {
    const admin  = await Admin.findOne({ uuid }) as IAdmin;
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }
    if(admin.client_id !== clientUuid) {
      console.log(req.body.client_id,clientUuid);
      res.status(403).json({ message: 'Forbidden: You do not have access to this admin' }); 
      return;
    }
    res.status(200).json(admin);
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// UPDATE ADMIN BY UUID
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findOneAndUpdate(
      { uuid: req.body.uuid },
      req.body,
      { new: true }
    );

    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    res.status(200).json(admin);
    logEvent('Admin updated by ' + req.body.uuid, req.body.uuid); // Log the event
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// UPDATE MANY ADMINS BY FILTER (e.g., is_active)
export const updateAdmins = async (req: Request, res: Response) => {
  try {
    const result = await Admin.updateMany({}, { $set: req.body });
    res.status(200).json({ message: `${result.modifiedCount} admin(s) updated` });
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// DELETE ADMIN BY UUID
export const deleteAdmin = async (req: Request, res: Response) => {
  // add client verification here
  const clientUuid = getClientUuidFromToken(req);
  if (!clientUuid) {
    res.status(401).json({ message: 'Unauthorized: No client token' });
    return;
  }
  const {uuid}=req.body;
  try {
    const admin = await Admin.findOneAndDelete({ uuid: uuid });
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }
    res.status(200).json({ message: 'Admin deleted' });
    logEvent('Admin deleted by ' + clientUuid, clientUuid); // Log the event
    deleteFromIds(clientUuid,uuid); // Log the action in the IDs table
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// DELETE MANY ADMINS BY CONDITION (e.g., inactive)
export const deleteAdmins = async (req: Request, res: Response) => {
  try {
    const result = await Admin.deleteMany(req.body);
    res.status(200).json({ message: `${result.deletedCount} admin(s) deleted` });
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// SEARCH ADMINS
export const searchAdmins = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const condition: any = {};

    if (query.email) condition.email = query.email;
    if (query.username) condition.username = new RegExp(query.username as string, 'i');
    if (query.is_active) condition.is_active = query.is_active === 'true';

    const admins = await Admin.find(condition);
    res.status(200).json(admins);
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};

// CREATE A GROUP
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name,client_id,uuid,number_of_students,activity_rate,payment_rate,isActive } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Group name is required' });
      return;
    }

    const admin = await Admin.findOne({uuid:client_id});
    console.log("here is the asdmin",admin);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    if (admin.accessible_groups_list.includes(name)) {
      res.status(400).json({ message: 'Group already exists in accessible groups list' });
      return;
    }

    const newGroup = new GroupModel({
      name,
      uuid,
      number_of_students,
      activity_rate,
      payment_rate,client_id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive
    });
    await newGroup.save();
      logEvent('Group created by '+client_id,client_id );
    admin.accessible_groups_list.push(name);
    await admin.save();
    res.status(201).json({ message: 'Group created successfully', admin });
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? `$this is error ${error.message}` : 'Unknown error' });
    return;
  }
};

// REMOVE A GROUP
const getAdminUuidFromToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  console.log("here is the authHeader",authHeader)
  if (!authHeader) return null;
  console.log("here is the authHeader",authHeader)
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key') as { uuid?: string };
    console.log("Decoded token",decoded)
    return decoded.uuid || null;
  } catch(error) {
    console.error('Invalid token:', error);
    return null;
  }
};

// REMOVE A GROUP
export const removeGroup = async (req: Request, res: Response) => {
  console.log("here is the remove group")
  try {
    // Extract admin UUID from token
    const client_id = getAdminUuidFromToken(req);
    console.log("client_id",client_id)
    if (!client_id) {
       res.status(401).json({ message: 'Unauthorized: No token or invalid token' });
       return;
    }

    const { name } = req.body;
    if (!name) {
       res.status(400).json({ message: 'Group name is required' });
       return;
    }

    // Find the admin based on the extracted UUID
    console.log("client_id",client_id)
    const admin = await Admin.findOne({ uuid: client_id });
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Check if the group exists in the accessible groups list
    const groupIndex = admin.accessible_groups_list.indexOf(name);
    console.log("groupIndex",admin.accessible_groups_list)
    if (groupIndex === -1) {
      res.status(400).json({ message: 'Group not found in accessible groups list' });
      return; 
    }

    // Remove the group and save the changes
    admin.accessible_groups_list.splice(groupIndex, 1);
    await admin.save();

    // Optionally log the event (You can use a logging service or write to a file)
    logEvent('Group removed by ' + client_id, client_id); // Assuming `logEvent` is a utility function

    res.status(200).json({ message: 'Group removed successfully', admin });
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};


// GET ALL GROUPS
export const getGroups = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    res.status(200).json({ groups: admin.accessible_groups_list });
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};
export const getGroupById = async (req: Request, res: Response) => {
  const adminUuid = getAdminUuidFromToken(req);
  if (!adminUuid) {
    res.status(401).json({ message: 'Unauthorized: No token or invalid token' });
    return;
  }
  const { uuid } = req.body;
  try {
    const group = await GroupModel.findOne({uuid});
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    if(group.client_id!=adminUuid){
      console.log(req.body.client_id,adminUuid);
      res.status(403).json({ message: 'Forbidden: You do not have access to this group' }); 
      return;
    }
    // Check if the group is in the admin's accessible groups list
    
    res.status(200).json(group);
    return;

  }catch (error) {

  }
}

// UPDATE GROUP NAME
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { oldGroupName, newGroupName } = req.body;
    if (!oldGroupName || !newGroupName) {
      res.status(400).json({ message: 'Old and new group names are required' });
      return;
    }

    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    const groupIndex = admin.accessible_groups_list.indexOf(oldGroupName);
    if (groupIndex === -1) {
      res.status(400).json({ message: 'Old group name not found' });
      return;
    }

    admin.accessible_groups_list[groupIndex] = newGroupName;
    await admin.save();

    res.status(200).json({ message: 'Group updated successfully', admin });
    return;
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
};
