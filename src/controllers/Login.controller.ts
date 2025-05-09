import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Ids from '../models/IDs.model';
import Client from '../models/Client.model';  // Assuming you have the Client model
import Staff from '../models/Staff.model';    // Assuming you have the Staff model
import Admin from '../models/Admin.model';    // Assuming you have the Admin model
import Student from '../models/Student.model'; // Assuming you have the Student model

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key'; // Use your secret key for JWT
// Login Function
export const login = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body)
  try {
    const { uuid,password } = req.body;  // Extract uuid from request body
    if(!uuid || !password ){
      res.status(400).json({message:"Please provide username and password"});
      return;
    }
    // Step 1: Check if the uuid exists in the 'Ids' table and get the role
    const userRole = await Ids.findOne({ uuid });
    if (!userRole) {
       res.status(404).json({ message: 'User not found in the system' });
       return;
    }

    // Step 2: Depending on the role, fetch the corresponding user data
    let user = null;
    switch (userRole.role) {
      case 'Client':
        user = await Client.findOne({ uuid,password });
        break;
      case 'Staff':
        user = await Staff.findOne({ uuid,password });
        break;
      case 'Admin':
        user = await Admin.findOne({ uuid,password });
        break;
      case 'Student':
        user = await Student.findOne({ uuid,password });
        break;
      default:
         res.status(400).json({ message: 'Invalid role' });
         return;
    }

    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    // Step 3: Create JWT token with user details (uuid, role, and any other necessary info)
    const token = jwt.sign(
      {
        uuid: user.uuid,
        role: userRole.role,
       password
      },
      SECRET_KEY,
      { expiresIn: '1h' } // JWT expires in 1 hour
    );

    // Step 4: Return the JWT token along with user details
    if(!user.password) {
      res.status(401).json({ message: 'Password is required' });
      return;
    }
    res.status(200).json({
      message: 'Login successful',
      token, 
      role:userRole.role, // The generated JWT token
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};
