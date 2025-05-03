import express from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask
} from '../controllers/Task.controller';

const router = express.Router();
router.post('/', createTask); //done
router.get('/', getAllTasks); //done
router.get('/byId', getTaskById); //done
router.put('/byId', updateTask); //done
router.delete('/byId', deleteTask); //done

export default router;
