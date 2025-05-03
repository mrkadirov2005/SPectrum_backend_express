import express from 'express';

import { createLog,
  getWholeLogs,
  getLogsByUserUuid
  // getLogsByUserUuid
  

 } from '../controllers/Logs.contoller';

const router = express.Router();
router.post('/', createLog); //done
router.get('/', getWholeLogs); //done
router.get('/mylogs',getLogsByUserUuid)
// router.get('/byId', getTaskById); //done
// router.put('/byId', updateTask); //done
// router.delete('/byId', deleteTask); //done

export default router;
