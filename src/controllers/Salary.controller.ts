import { Request, Response } from 'express';
import Salary from '../models/Salary.model';
import getClientUuidFromToken from '../middlewares/extractUUID';
import Ids from '../models/IDs.model';
import StaffModel from '../models/Staff.model';
import logEvent from '../middlewares/createLogs';

// CREATE Salary
export const createSalary = async (req: Request, res: Response) => {
  const { uuid, addedBy, fixed, KPI, total, period, status } = req.body;

  if (!uuid || !addedBy || !fixed || KPI === undefined || !total || !period || !status) {
     res.status(400).json({ message: 'Please fill all the data' });
     return;
  }

  const token = getClientUuidFromToken(req);
  if (!token) {
     res.status(400).json({ message: 'Please provide token' });
     return;
  }

  try {
    const isClient = await Ids.findOne({ uuid: token });
    if (!isClient) {
        res.status(400).json({ message: 'You are not registered in our system' });
        return 
    }

    if (isClient.role !== 'Client') {
        res.status(401).json({ message: 'You are not a client to add salary' });
        return; 
    }

    const staff = await StaffModel.findOne({ uuid });
    if (!staff) {
        res.status(404).json({ message: 'This staff is not available' });
        return
    }

    if (staff.adminId !== token) {
        res.status(401).json({ message: 'You are not allowed to add salary to this staff' });
        return
    }
    // check isALready CalculatedSalary
    const salar=await Salary.findOne({uuid:req.body.uuid,period:req.body.period});
    if(salar){
        res.status(409).json({message:"This staff has got card opened for this period"});
        return;
    }
    const neSalary={
        ...req.body,
        updatedAt:new Date(),
        date:new Date()
    }
    const newSalary = await Salary.create(neSalary);
    res.status(201).json(newSalary);
    logEvent(token, 'Created Salary for the staff with id ' + uuid);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create salary', error });
  }
};

// GET All Salaries
export const getAllSalaries = async (req: Request, res: Response) => {
  const token = getClientUuidFromToken(req);
  if (!token) {
      res.status(400).json({ message: 'Invalid or missing token' });
      return
  }

  try {
    const salaries = await Salary.find({ addedBy: token }).sort({ createdAt: -1 });
    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch salaries', error });
  }
};

// GET One Staff's Salaries
export const getSalaryById = async (req: Request, res: Response) => {
  const { uuid } = req.body;

  if (!uuid) {
      res.status(400).json({ message: 'Please provide staff UUID' });
      return
  }

  const token = getClientUuidFromToken(req);
  if (!token) {
      res.status(400).json({ message: 'Invalid or missing token' });
      return
  }

  try {
    const salaries = await Salary.find({ uuid, addedBy: token });
    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch salary', error });
  }
};

// UPDATE Salary
export const updateSalary = async (req: Request, res: Response) => {
  const token = getClientUuidFromToken(req);
  const { id } = req.body;

  if (!token) {
      res.status(400).json({ message: 'Invalid or missing token' });
      return
  }

  try {
    const salary = await Salary.findById(id);
    if (!salary) {
        res.status(404).json({ message: 'No salary found to update' });
        return;
    }

    if (salary.addedBy !== token) {
        res.status(403).json({ message: 'You are not allowed to update this salary' });
        return;
    }

    const updated = await Salary.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
    logEvent(token,id+" Salary has been updated by "+ token)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update salary', error });
  }
};

// DELETE Salary
export const deleteSalary = async (req: Request, res: Response) => {
  const token = getClientUuidFromToken(req);
  const { id } = req.body;

  if (!token) {
      res.status(400).json({ message: 'Invalid or missing token' });
      return
  }

  try {
    const salary = await Salary.findById(id);
    if (!salary) {
        res.status(404).json({ message: 'No salary found to delete' });
        return
    }

    if (salary.addedBy !== token) {
        res.status(403).json({ message: 'You are not allowed to delete this salary' });
        return
    }

    await Salary.findByIdAndDelete(id);
    res.status(200).json({ message: 'Salary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete salary', error });
  }
};
