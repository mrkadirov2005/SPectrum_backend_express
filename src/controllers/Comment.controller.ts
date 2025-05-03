import { Request, Response } from 'express';
import Comment from '../models/Comment.model';
import Staff from '../models/Staff.model';
import Admin from '../models/Admin.model';
import jwt from 'jsonwebtoken';
import logEvent from '../middlewares/createLogs';
import Ids from '../models/IDs.model';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

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

// CREATE COMMENT — Anyone can create a comment (no role verification)
export const createComment = async (req: Request, res: Response): Promise<void> => {
  const givenBy = getClientUuidFromToken(req);
  if(!givenBy) {
    res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
    return;
  }
  try {
    const { targetId, content } = req.body;

    // Create the comment object
    const comment = new Comment({
      targetId,
      content,
      createdAt: new Date(),
      createdBy: givenBy,
    });

    await comment.save();
    logEvent(targetId, 'Comment Created by '+givenBy);

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// GET ALL COMMENTS
export const getAllComments = async (_req: Request, res: Response): Promise<void> => {
  const admin = getClientUuidFromToken(_req);
  if(!admin) {
    res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
    return;
  }
  const getterId=await Ids.findOne({uuid:admin});
if(getterId?.role!=='Admin' && getterId?.role!=='Client'){
  res.status(403).json({ message: 'Unauthorized: Only admin can get all comments' });
  return;
}
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// GET COMMENTS BY TARGET ID
export const getCommentsByTargetId = async (req: Request, res: Response): Promise<void> => {
  const getterId = getClientUuidFromToken(req);
  if(!getterId) {
    res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
    return;
  }
  const isAccessible = await Ids.findOne({ uuid: getterId });
  if (isAccessible?.role !== 'Admin' && isAccessible?.role !== 'Client' && isAccessible?.role !== 'Staff' && isAccessible?.role !== 'Student') {
    res.status(403).json({ message: 'Unauthorized: Only admin can get comments by targetId' });
    return;
  }

  try {
    const { targetId } = req.body;
    const comments = await Comment.find({ targetId });

    if (comments.length === 0) {
      res.status(404).json({ message: 'No comments found for this targetId' });
      return;
    }

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// GET COMMENTS BY GIVEN BY (Creator of the Comment)
export const getCommentsByGivenBy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { givenBy } = req.params;
    const comments = await Comment.find({ givenBy });

    if (comments.length === 0) {
      res.status(404).json({ message: 'No comments found for this givenBy' });
      return;
    }

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// DELETE COMMENT — Only Admin or the Creator (Teacher) can delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
  const token=getClientUuidFromToken(req);
  if(!token) {
    res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
    return;
  }
    const commentToDelete = await Comment.findOne({ _id: req.body._id });
    if(!commentToDelete) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    if (commentToDelete.createdBy!==token) {
      res.status(404).json({ message: 'You are not allowed to delete the comment' });
      return;
    }

    
      await commentToDelete.deleteOne();
      res.status(200).json({ message: 'Comment deleted successfully' });
      logEvent(token, 'Comment Deleted by '+token);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};

// DELETE ALL COMMENTS — Only Admin can delete all comments
export const deleteAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Unauthorized: Token missing' });
      return;
    }

    // Decode JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as { uuid: string };
    const user_uuid = decoded.uuid;

    // Check if the user is an admin
    const admin = await Admin.findOne({ uuid: user_uuid });
    if (!admin) {
      res.status(403).json({
        message: 'Unauthorized: Only an admin can delete all comments',
      });
      return;
    }

    // Delete all comments
    await Comment.deleteMany({});
    res.status(200).json({ message: 'All comments deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
};
