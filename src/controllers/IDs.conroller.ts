import { Request, Response } from 'express';
import Ids from '../models/IDs.model'; // Adjust the path to your Ids model

// CREATE ID — Add a new ID with a role
export const createId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, role } = req.body;
    // Check if the required fields are provided
    if (!uuid || !role) {
      res.status(400).json({ message: 'UUID and role are required' });
      return;
    }

    // Validate role
    if (!['Admin', 'Staff', 'Client', 'Student'].includes(role)) {
      res.status(400).json({ message: 'Invalid role provided' });
      return;
    }

    // Check if the UUID already exists in the database
    const existingId = await Ids.findOne({ uuid });
    if (existingId) {
      res.status(409).json({ message: 'UUID already exists' });
      return;
    }

    // Create the new ID document
    const newId = new Ids({ uuid, role });
    await newId.save();

    res.status(201).json(newId);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// GET ALL IDS — Retrieve all the IDs and roles
export const getAllIds = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ids = await Ids.find();
    res.status(200).json(ids);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// GET ID BY UUID — Retrieve the ID by UUID
export const getIdByUuid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid } = req.params;

    const id = await Ids.findOne({ uuid });
    if (!id) {
      res.status(404).json({ message: 'ID not found' });
      return;
    }

    res.status(200).json(id);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// UPDATE ID ROLE — Update the role of a specific user by UUID
export const updateIdRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid } = req.params;
    const { role } = req.body;

    // Validate the role
    if (!['Admin', 'Staff', 'Client', 'Student'].includes(role)) {
      res.status(400).json({ message: 'Invalid role provided' });
      return;
    }

    const updatedId = await Ids.findOneAndUpdate(
      { uuid },
      { role },
      { new: true } // Return the updated document
    );

    if (!updatedId) {
      res.status(404).json({ message: 'ID not found' });
      return;
    }

    res.status(200).json(updatedId);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// DELETE ID — Delete an ID by UUID
export const deleteId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid } = req.params;

    const deletedId = await Ids.findOneAndDelete({ uuid });
    if (!deletedId) {
      res.status(404).json({ message: 'ID not found' });
      return;
    }

    res.status(200).json({ message: 'ID deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};
