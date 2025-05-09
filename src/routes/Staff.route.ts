import express from 'express';
import {
  createStaff,deleteStaff,getAllStaff,getMyGroups,getStaffByUuid,updateStaff
  } from '../controllers/Staff.controller';

const router = express.Router();

router.post('/', createStaff);
router.get('/', getAllStaff);
router.get('/groups', getMyGroups);
router.post('/uuid', getStaffByUuid);
router.put('/:uuid', updateStaff);
router.delete('/:uuid', deleteStaff);

export default router;
