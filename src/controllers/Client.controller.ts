import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';  // Import the UUID generator
import Client from '../models/Client.model';
import Admin from '../models/Admin.model'; // Assuming Admin model exists for logging actions
import {createLog} from "./Logs.contoller"
import logEvent from '../middlewares/createLogs';
import addToIds from '../middlewares/addToIds';
// Function to log actions for admins


// CREATE - Create a new client
export const createClient = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password,username, phone, is_active, uuid } = req.body;
    const adminUuid = req.body.adminUuid;  // Assuming the admin's UUID is sent with the request

    // Use the UUID from frontend if provided, otherwise generate one
    const clientUuid = uuid || uuidv4();

    const client = new Client({
      first_name,
      last_name,
      username,
      email,
      password,
      phone,
      is_active,
      uuid: clientUuid,  // Use the frontend UUID or the generated one
    });

    await client.save();
    await addToIds(clientUuid, "Client");  // Log the action in the IDs table
    // Log the creation action
    await logEvent(uuid,"A client with "+uuid+ " has been added");

    res.status(201).json(client);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
// GET ALL - Get all clients
export const getClients = async (_req: Request, res: Response) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
// GET ONE - Get client by UUID
export const getClientByUuid = async (req: Request, res: Response) => {
  try {
    const client = await Client.findOne({ uuid: req.params.uuid });
    if (!client) {
       res.status(404).json({ message: 'Client not found' });
       return;
    }

    // Log the view action
    const adminUuid = req.body.uuid;  // Assuming the admin's UUID is sent with the request
    if (adminUuid) {
      await logEvent(adminUuid, `Viewed client: ${client.first_name} ${client.last_name} (${client.uuid})`);
    }

    res.status(200).json(client);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// UPDATE ONE - Update a specific client by UUID
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, phone, is_active, uuid,password } = req.body;
    const adminUuid = req.body.uuid;  // Assuming the admin's UUID is sent with the request

    const client = await Client.findOneAndUpdate(
      { uuid: req.body.uuid },
      { first_name, last_name, email, phone, is_active, uuid,password },
      { new: true }
    );

    if (!client) {
     res.status(404).json({ message: 'Client not found' });
     return;
    }

    // Log the update action
    if (adminUuid) {
      await logEvent(adminUuid, `Updated client: ${client.first_name} ${client.last_name} (${client.uuid})`);
    }

    res.status(200).json(client);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// DELETE ONE - Delete a specific client by UUID
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findOneAndDelete({ uuid: req.params.uuid });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return ;
    }

    // Log the deletion action
    const adminUuid = req.body.uuid;  // Assuming the admin's UUID is sent with the request
    if (adminUuid) {
      await logEvent(adminUuid, `Deleted client: ${client.first_name} ${client.last_name} (${client.uuid})`);
    }

    res.status(200).json({ message: 'Client deleted' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// DELETE MANY - Delete multiple clients by condition (e.g., `is_active` status)
export const deleteClients = async (req: Request, res: Response) => {
  try {
    const { is_active } = req.body;
    const adminUuid = req.body.uuid;  // Assuming the admin's UUID is sent with the request

    const clients = await Client.deleteMany({ is_active });
    if (!clients.deletedCount) {
      return res.status(404).json({ message: 'No clients found to delete' });
    }

    // Log the bulk deletion action
    if (adminUuid) {
      await logEvent(adminUuid, `Deleted multiple clients with is_active = ${is_active}`);
    }

    res.status(200).json({ message: 'Clients deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// SEARCH - Search clients based on query parameters (e.g., by `first_name`, `last_name`)
export const searchClients = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const searchCondition: any = {};

    if (query.first_name) searchCondition.first_name = new RegExp(query.first_name as string, 'i');
    if (query.last_name) searchCondition.last_name = new RegExp(query.last_name as string, 'i');
    if (query.email) searchCondition.email = query.email;

    const clients = await Client.find(searchCondition);

    if (!clients.length) {
      return res.status(404).json({ message: 'No clients found matching the criteria' });
    }

    res.status(200).json(clients);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
