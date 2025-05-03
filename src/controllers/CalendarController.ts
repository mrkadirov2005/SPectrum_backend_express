import { Request, Response } from 'express';
import Calendar from '../models/Calendar.model';
import jwt from 'jsonwebtoken';

const getClientUuidFromToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key') as { uuid?: string };
    return decoded.uuid || null;
  } catch {
    console.error('Invalid token');
    return null;
  }
};

// ✅ Create calendar
export const createCalendar = async (req: Request, res: Response) => {
  const uuidFromToken = getClientUuidFromToken(req);
  if (!uuidFromToken) {
    res.status(401).json({ message: 'Unauthorized request' });
    return;
  }
  if (!req.body.time || !req.body.comment ) {
    res.status(400).json({ message: 'Please provide time, comment, and status' });
    return;
  }
  const { time, comment, status } = req.body;
  
  
  try {
    const calendarFoundByTime=await Calendar.findOne({time,uuid:uuidFromToken}).exec();
    if(calendarFoundByTime){
        res.status(401).json({message:"This time has already been occupied, if you want you can Update it"})
        return;
    }
    const calendar = await Calendar.create({
      uuid: uuidFromToken,
      time,
      comment,
      status,
    });
    res.status(201).json(calendar);
    return;
  } catch (error) {
    res.status(400).json({ message: 'Failed to create calendar', error });
    return;
  }
};

// ✅ Get all calendars (admin access – optional filter later)
export const getAllCalendars = async (_req: Request, res: Response) => {
  try {
    const calendars = await Calendar.find();
    res.status(200).json(calendars);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch calendars', error });
    return;
  }
};

// ✅ Get calendar by ID
export const getCalendarById = async (req: Request, res: Response) => {
    const token=getClientUuidFromToken(req);
    if(!token){
        res.status(401).json({message:"No client token"});
        return;
    }
    
  try {
    const calendar = await Calendar.find({uuid:token});
    if (!calendar) {
      res.status(404).json({ message: 'Calendar not found' });
      return;
    }
    res.status(200).json(calendar);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calendar', error });
    return;
  }
};

// ✅ Update calendar (only by owner)
export const updateCalendar = async (req: Request, res: Response) => {
  const uuidFromToken = getClientUuidFromToken(req);
  if (!uuidFromToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const existing = await Calendar.findById(req.body.id);
    if (!existing) {
      res.status(404).json({ message: 'Calendar not found' });
      return;
    }

    if (existing.uuid !== uuidFromToken) {
      res.status(403).json({ message: 'You are not allowed to update this calendar entry' });
      return;
    }

    const { time, comment, status } = req.body;
    if (!time || !comment || !status) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    existing.time = time;
    existing.comment = comment;
    existing.status = status;

    const updated = await existing.save();
    res.status(200).json(updated);
    return;
  } catch (error) {
    res.status(400).json({ message: 'Failed to update calendar', error });
    return;
  }
};

// ✅ Delete calendar (only by owner)
export const deleteCalendar = async (req: Request, res: Response) => {
  const uuidFromToken = getClientUuidFromToken(req);
  if (!uuidFromToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const calendar = await Calendar.findById(req.body.id);
    if (!calendar) {
      res.status(404).json({ message: 'Calendar not found' });
      return;
    }

    if (calendar.uuid !== uuidFromToken) {
      res.status(403).json({ message: 'You are not allowed to delete this calendar entry' });
      return;
    }

    await calendar.deleteOne();
    res.status(200).json({ message: 'Calendar deleted successfully' });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete calendar', error });
    return;
  }
};
