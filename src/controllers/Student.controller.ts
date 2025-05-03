// students.controller.ts

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // To generate a new UUID if needed
import Student from '../models/Student.model';
import Log from '../models/Logs.model'; // Import the Log model
import jwt from 'jsonwebtoken';
import logEvent from '../middlewares/createLogs';
import addToIds from '../middlewares/addToIds';
import deleteFromIds from '../middlewares/deleteFromIds';

// CREATE - Create a new student
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
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const adminId=req.headers.authorization;
  if(!adminId){
    res.status(500).json({message:"No admin Token provided"})
    return;
  }
  const adminUUid=getAdminUuidFromToken(req);
  if(!adminUUid){
    res.status(500).json({message:"invalid Token provided"});
    return;
  }
  try {
    const { first_name, last_name, phone_number, password, username, courses, grades, group_id, test_result, uuid } = req.body;

    // Generate UUID if not provided
    const studentUuid = uuid || uuidv4();

    const student = new Student({
      first_name,
      last_name,
      phone_number,
      password,
      username,
      courses,
      grades,
      group_id,
      test_result,
      uuid: studentUuid,
    });

    await student.save();
  logEvent(`Student with UUID ${studentUuid} created by admin with UUID ${adminUUid}`, adminUUid);
  addToIds(studentUuid,"Student");
    // Extract user UUID directly from the Authorization header
    const userUuid = req.headers['authorization']?.split(' ')[1]; // Token is expected as Bearer <token>
    if (!userUuid) {
      res.status(403).json({ message: 'Authorization token required' });
      return;
    }

    // Log the action (who created the student and when)
    const logMessage = `Student with UUID ${studentUuid} created.`;
    const log = new Log({
      userUuid,  // Using the UUID from the Authorization header
      message: logMessage,
      date: new Date(),
    });

    await log.save();

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// UPDATE ONE - Update a student by UUID
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, phone_number, courses, grades, test_result } = req.body;
    const studentUuid = req.body.uuid;

    const student = await Student.findOneAndUpdate(
      { uuid: studentUuid },
      { first_name, last_name, phone_number, courses, grades, test_result },
      { new: true }
    );

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Extract user UUID directly from the Authorization header
    const userUuid = req.headers['authorization']?.split(' ')[1]; // Token is expected as Bearer <token>
    if (!userUuid) {
      res.status(403).json({ message: 'Authorization token required' });
      return;
    }

    // Log the action (who updated the student and when)
    const logMessage = `Student with UUID ${studentUuid} updated.`;
    const log = new Log({
      userUuid,  // Using the UUID from the Authorization header
      message: logMessage,
      date: new Date(),
    });

    await log.save();

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// DELETE ONE - Delete a student by UUID
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  const adminToken=getAdminUuidFromToken(req);
   if(!adminToken){
    res.status(403).json({message:"No token or invalid or expired token"});
    return;
   }
  try {
    const studentUuid = req.body.uuid;

    const student = await Student.findOneAndDelete({ uuid: studentUuid });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Extract user UUID directly from the Authorization header
    const userUuid = req.headers['authorization']?.split(' ')[1]; // Token is expected as Bearer <token>
    if (!userUuid) {
      res.status(403).json({ message: 'Authorization token required' });
      return;
    }

    // Log the action (who deleted the student and when)
    
    logEvent(adminToken,"Student deleted with ID"+studentUuid +"by "+adminToken);
    deleteFromIds(adminToken,studentUuid)

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// GET ALL - Fetch all students
export const getStudents = async (req: Request, res: Response): Promise<void> => {
  const adminToken=getAdminUuidFromToken(req);
  if(!adminToken){
    res.status(403).json({message:"Unauthorized or invalid token"});
    return;
  }
  try {
    const students = await Student.find();
    if (students.length === 0) {
      res.status(404).json({ message: 'No students found' });
      return;
    }
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// GET ONE - Fetch student by UUID
export const getStudentByUuid = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ uuid: req.body.uuid });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
