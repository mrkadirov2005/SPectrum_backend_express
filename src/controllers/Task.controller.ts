import { Request, Response } from 'express';
import Task from '../models/Task.model';
import getClientUuidFromToken from '../middlewares/extractUUID';
import Ids from '../models/IDs.model';

// CREATE A NEW TASK
export const createTask = async (req: Request, res: Response): Promise<void> => {
  const token=getClientUuidFromToken(req)
  try {
    if (!token) {
      console.log(token)
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const cliendRole=await Ids.findOne({uuid:token})
    if (!cliendRole==null) {
      res.status(401).json({ message: 'You are not a member of Spectrum Academy' });
      return;
    }

    const { title, content, target_id, given_date, deadline,  status } = req.body;

    const task = new Task({
      title,
      content,
      target_id,
      given_date,
      deadline,
      givenBy:token,
      status: status || 'pending',
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error });
  }
};

// GET ALL TASKS
export const getAllTasks = async (_req: Request, res: Response): Promise<void> => {
  const token=getClientUuidFromToken(_req)
  try {

  if(!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const cliendRole=await Ids.findOne({uuid:token})
  if (!cliendRole==null) {
    res.status(401).json({ message: 'You are not a member of Spectrum Academy' });
    return;
  }
  
    const tasks = await Task.find({givenBy:token});
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
};

// GET TASK BY ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const token=getClientUuidFromToken(req);
  const {_id}=req.body
  try {
    const cliendRole=await Ids.findOne({uuid:token})
    if (!cliendRole==null) {
      res.status(401).json({ message: 'You are not a member of Spectrum Academy' });
      return;
    }
    const task = await Task.findOne({_id});
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    if(task.givenBy!=token && task.target_id!=token) {
      res.status(401).json({ message: 'You are not authorized to view this task' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task'+ error });
  }
};

// UPDATE TASK
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const token=getClientUuidFromToken(req)
  if(!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const foundData=await Task.findOne({_id:req.body._id});
    if(!foundData) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    if(foundData.givenBy!=token ) {
      res.status(401).json({ message: 'You are not authorized to update this task' });
      return;
    }
    const updated = await Task.findByIdAndUpdate({_id:req.body._id},req.body)
    if (!updated) {
      res.status(404).json({ message: 'Task not found to update' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

// DELETE TASK
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  
  try {
    const token=getClientUuidFromToken(req)
    if(!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if(!req.body._id) {
      res.status(400).json({ message: 'Task ID is required' });
      return;
    }
    const foundData=await Task.findOne({_id:req.body._id});
    if(!foundData) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    if(foundData.givenBy!=token ) {
      res.status(401).json({ message: 'You are not authorized to delete this task' });
      return;
    }
    const deleted = await Task.findByIdAndDelete(req.body._id);
    if (!deleted) {
      res.status(404).json({ message: 'Task not found to delete' });
      return;
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};
